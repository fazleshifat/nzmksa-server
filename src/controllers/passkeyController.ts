import { Request, Response } from "express";

import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    type WebAuthnCredential,
} from "@simplewebauthn/server";

import {
    Employee,
    type IPasskey,
} from "../models/Employee";

import { Admin } from "../models/Admin";

import {
    WebAuthnChallenge,
    type WebAuthnAccountType,
    type WebAuthnChallengeType,
} from "../models/WebAuthnChallenge";

import { createSession } from "../utils/createSession";
import { signToken } from "../utils/token";

/* ============================================================
   CONFIG
============================================================ */

const RP_NAME =
    process.env.WEBAUTHN_RP_NAME ||
    "Absher";

const RP_ID =
    process.env.WEBAUTHN_RP_ID ||
    "absher-client.vercel.app";

const getExpectedOrigins = (): string[] => {
    const origins =
        process.env.WEBAUTHN_ORIGINS
            ?.split(",")
            .map((origin) => origin.trim())
            .filter(Boolean);

    if (
        origins &&
        origins.length > 0
    ) {
        return origins;
    }

    return [
        "https://absher-client.vercel.app",
    ];
};

const CHALLENGE_EXPIRATION_MS =
    5 * 60 * 1000;

/* ============================================================
   TYPES
============================================================ */

type AccountType =
    | "employee"
    | "admin";

interface EmployeeAccount {
    type: "employee";
    account: any;
}

interface AdminAccount {
    type: "admin";
    account: any;
}

type Account =
    | EmployeeAccount
    | AdminAccount;

/* ============================================================
   HELPER
   Get currently logged-in account
============================================================ */

const getAccountFromRequest =
    async (
        req: any
    ): Promise<Account | null> => {
        const userId =
            req.user?.userId;

        const role =
            req.user?.role;

        if (!userId) {
            return null;
        }

        /* ----------------------------------------------------
           EMPLOYEE
        ---------------------------------------------------- */

        if (
            role === "user"
        ) {
            const employee =
                await Employee.findById(
                    userId
                ).select("+password");

            if (!employee) {
                return null;
            }

            return {
                type: "employee",
                account: employee,
            };
        }

        /* ----------------------------------------------------
           ADMIN / SUPER ADMIN
        ---------------------------------------------------- */

        if (
            role === "admin" ||
            role === "superadmin"
        ) {
            const admin =
                await Admin.findById(
                    userId
                ).select("+password");

            if (!admin) {
                return null;
            }

            /*
             * Extra protection:
             *
             * If JWT says superadmin but
             * database account is not superadmin,
             * do not trust the JWT role alone.
             */
            if (
                role === "superadmin" &&
                admin.role !== "superadmin"
            ) {
                return null;
            }

            return {
                type: "admin",
                account: admin,
            };
        }

        return null;
    };

/* ============================================================
   HELPER
   Save WebAuthn challenge
============================================================ */

const saveChallenge = async (
    accountId: string,
    accountType: WebAuthnAccountType,
    challenge: string,
    type: WebAuthnChallengeType
) => {
    await WebAuthnChallenge.deleteMany({
        accountId,
        accountType,
        type,
    });

    const expiresAt =
        new Date(
            Date.now() +
            CHALLENGE_EXPIRATION_MS
        );

    return WebAuthnChallenge.create({
        accountId,
        accountType,
        challenge,
        type,
        expiresAt,
    });
};

/* ============================================================
   HELPER
   Find Employee/Admin using identifier
============================================================ */

const findAccountByIdentifier =
    async (
        identifier: string
    ): Promise<Account | null> => {
        const cleanIdentifier =
            identifier.trim();

        if (!cleanIdentifier) {
            return null;
        }

        /* ----------------------------------------------------
           EMPLOYEE
           Resident ID
        ---------------------------------------------------- */

        const employee =
            await Employee.findOne({
                residentIdNumber:
                    cleanIdentifier,
            });

        if (employee) {
            return {
                type: "employee",
                account: employee,
            };
        }

        /* ----------------------------------------------------
           ADMIN / SUPER ADMIN
           Email
        ---------------------------------------------------- */

        const admin =
            await Admin.findOne({
                email:
                    cleanIdentifier
                        .toLowerCase(),
            });

        if (admin) {
            return {
                type: "admin",
                account: admin,
            };
        }

        return null;
    };

/* ============================================================
   HELPER
   Convert MongoDB passkey to WebAuthn credential
============================================================ */

const toWebAuthnCredential = (
    passkey: IPasskey
): WebAuthnCredential => {
    return {
        id:
            passkey.credentialId,

        publicKey:
            new Uint8Array(
                passkey.publicKey
            ),

        counter:
            passkey.counter,

        transports:
            passkey.transports as any,
    };
};

/* ============================================================
   REGISTER PASSKEY OPTIONS
============================================================ */

export const registerPasskeyOptions =
    async (
        req: any,
        res: Response
    ): Promise<void> => {
        try {
            const account =
                await getAccountFromRequest(
                    req
                );

            if (!account) {
                res.status(401).json({
                    message:
                        "Authenticated account not found",
                });

                return;
            }

            let userName =
                "";

            let existingPasskeys:
                IPasskey[] = [];

            /* ====================================================
               EMPLOYEE
            ==================================================== */

            if (
                account.type ===
                "employee"
            ) {
                userName =
                    String(
                        account.account
                            .residentIdNumber
                    );

                existingPasskeys =
                    (
                        account.account
                            .passkeys || []
                    ) as IPasskey[];
            }

            /* ====================================================
               ADMIN / SUPER ADMIN
            ==================================================== */

            else {
                userName =
                    String(
                        account.account
                            .email
                    );

                existingPasskeys =
                    (
                        account.account
                            .passkeys || []
                    ) as IPasskey[];
            }

            const options =
                await generateRegistrationOptions(
                    {
                        rpName:
                            RP_NAME,

                        rpID:
                            RP_ID,

                        userName,

                        attestationType:
                            "none",

                        excludeCredentials:
                            existingPasskeys.map(
                                (
                                    passkey: IPasskey
                                ) => ({
                                    id:
                                        passkey.credentialId,

                                    transports:
                                        passkey.transports as any,
                                })
                            ),

                        authenticatorSelection:
                        {
                            residentKey:
                                "preferred",

                            userVerification:
                                "required",

                            authenticatorAttachment:
                                "platform",
                        },
                    }
                );

            await saveChallenge(
                account.account
                    ._id
                    .toString(),

                account.type,

                options.challenge,

                "registration"
            );

            res.json(
                options
            );
        } catch (error) {
            console.error(
                "PASSKEY REGISTER OPTIONS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to create passkey registration options",
            });
        }
    };

/* ============================================================
   REGISTER PASSKEY VERIFY
============================================================ */

export const registerPasskeyVerify =
    async (
        req: any,
        res: Response
    ): Promise<void> => {
        try {
            const account =
                await getAccountFromRequest(
                    req
                );

            if (!account) {
                res.status(401).json({
                    message:
                        "Authenticated account not found",
                });

                return;
            }

            const challenge =
                await WebAuthnChallenge.findOne(
                    {
                        accountId:
                            account.account
                                ._id,

                        accountType:
                            account.type,

                        type:
                            "registration",

                        expiresAt: {
                            $gt: new Date(),
                        },
                    }
                ).sort({
                    createdAt: -1,
                });

            if (!challenge) {
                res.status(400).json({
                    message:
                        "Passkey registration session expired. Please try again.",
                });

                return;
            }

            let verification;

            try {
                verification =
                    await verifyRegistrationResponse(
                        {
                            response:
                                req.body,

                            expectedChallenge:
                                challenge.challenge,

                            expectedOrigin:
                                getExpectedOrigins(),

                            expectedRPID:
                                RP_ID,

                            requireUserVerification:
                                true,
                        }
                    );
            } catch (error) {
                console.error(
                    "PASSKEY REGISTRATION VERIFICATION ERROR:",
                    error
                );

                await WebAuthnChallenge.deleteOne(
                    {
                        _id:
                            challenge._id,
                    }
                );

                res.status(400).json({
                    message:
                        "Passkey registration verification failed",
                });

                return;
            }

            await WebAuthnChallenge.deleteOne(
                {
                    _id:
                        challenge._id,
                }
            );

            if (
                !verification.verified ||
                !verification.registrationInfo
            ) {
                res.status(400).json({
                    message:
                        "Passkey registration was not verified",
                });

                return;
            }

            const {
                credential,
                credentialDeviceType,
                credentialBackedUp,
            } =
                verification.registrationInfo;

            /* ====================================================
               CHECK DUPLICATE + SAVE
            ==================================================== */

            const passkeys =
                (
                    account.account
                        .passkeys || []
                ) as IPasskey[];

            const existingCredential =
                passkeys.find(
                    (
                        passkey: IPasskey
                    ) =>
                        passkey
                            .credentialId ===
                        credential.id
                );

            if (
                existingCredential
            ) {
                res.status(409).json({
                    message:
                        "This passkey is already registered",
                });

                return;
            }

            account.account.passkeys =
                account.account
                    .passkeys || [];

            account.account.passkeys.push(
                {
                    credentialId:
                        credential.id,

                    publicKey:
                        Buffer.from(
                            credential.publicKey
                        ),

                    counter:
                        credential.counter,

                    transports:
                        credential.transports as
                        | string[]
                        | undefined,

                    deviceType:
                        credentialDeviceType,

                    backedUp:
                        credentialBackedUp,
                }
            );

            await account.account.save();

            /* ====================================================
               RESPONSE
            ==================================================== */

            res.json({
                verified: true,

                accountType:
                    account.type,

                /*
                 * For admin accounts return
                 * the exact database role.
                 */
                ...(account.type ===
                    "admin"
                    ? {
                        role:
                            account.account
                                .role,
                    }
                    : {
                        role: "user",
                    }),

                message:
                    "Passkey registered successfully",
            });
        } catch (error) {
            console.error(
                "PASSKEY REGISTER VERIFY ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to register passkey",
            });
        }
    };

/* ============================================================
   LOGIN PASSKEY OPTIONS
============================================================ */

export const loginPasskeyOptions =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const identifier =
                String(
                    req.body?.identifier ??
                    req.body
                        ?.residentIdNumber ??
                    req.body?.email ??
                    ""
                ).trim();

            if (!identifier) {
                res.status(400).json({
                    message:
                        "Username, Resident ID number, or email is required",
                });

                return;
            }

            const account =
                await findAccountByIdentifier(
                    identifier
                );

            if (!account) {
                res.status(401).json({
                    message:
                        "Invalid credentials",
                });

                return;
            }

            /* ----------------------------------------------------
               ADMIN ACTIVE CHECK
            ---------------------------------------------------- */

            if (
                account.type ===
                "admin" &&
                !account.account.active
            ) {
                res.status(401).json({
                    message:
                        "This account is inactive",
                });

                return;
            }

            /* ----------------------------------------------------
               PASSKEY CHECK
            ---------------------------------------------------- */

            const passkeys =
                (
                    account.account
                        .passkeys || []
                ) as IPasskey[];

            if (
                passkeys.length === 0
            ) {
                res.status(400).json({
                    message:
                        "No passkey is registered for this account",
                });

                return;
            }

            const options =
                await generateAuthenticationOptions(
                    {
                        rpID:
                            RP_ID,

                        userVerification:
                            "required",

                        allowCredentials:
                            passkeys.map(
                                (
                                    passkey: IPasskey
                                ) => ({
                                    id:
                                        passkey.credentialId,

                                    transports:
                                        passkey.transports as any,
                                })
                            ),
                    }
                );

            await saveChallenge(
                account.account
                    ._id
                    .toString(),

                account.type,

                options.challenge,

                "authentication"
            );

            res.json(
                options
            );
        } catch (error) {
            console.error(
                "PASSKEY LOGIN OPTIONS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to create passkey login options",
            });
        }
    };

/* ============================================================
   LOGIN PASSKEY VERIFY
============================================================ */

export const loginPasskeyVerify =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const identifier =
                String(
                    req.body?.identifier ??
                    req.body
                        ?.residentIdNumber ??
                    req.body?.email ??
                    ""
                ).trim();

            const response =
                req.body?.response;

            if (
                !identifier ||
                !response
            ) {
                res.status(400).json({
                    message:
                        "Username/ID and passkey response are required",
                });

                return;
            }

            const account =
                await findAccountByIdentifier(
                    identifier
                );

            if (!account) {
                res.status(401).json({
                    message:
                        "Invalid credentials",
                });

                return;
            }

            /* ----------------------------------------------------
               ADMIN ACTIVE CHECK
            ---------------------------------------------------- */

            if (
                account.type ===
                "admin" &&
                !account.account.active
            ) {
                res.status(401).json({
                    message:
                        "This account is inactive",
                });

                return;
            }

            /* ----------------------------------------------------
               FIND CHALLENGE
            ---------------------------------------------------- */

            const challenge =
                await WebAuthnChallenge.findOne(
                    {
                        accountId:
                            account.account
                                ._id,

                        accountType:
                            account.type,

                        type:
                            "authentication",

                        expiresAt: {
                            $gt: new Date(),
                        },
                    }
                ).sort({
                    createdAt: -1,
                });

            if (!challenge) {
                res.status(400).json({
                    message:
                        "Passkey login session expired. Please try again.",
                });

                return;
            }

            /* ----------------------------------------------------
               FIND STORED PASSKEY
            ---------------------------------------------------- */

            const passkeys =
                (
                    account.account
                        .passkeys || []
                ) as IPasskey[];

            const storedPasskey =
                passkeys.find(
                    (
                        passkey: IPasskey
                    ) =>
                        passkey
                            .credentialId ===
                        response.id
                );

            if (!storedPasskey) {
                await WebAuthnChallenge.deleteOne(
                    {
                        _id:
                            challenge._id,
                    }
                );

                res.status(401).json({
                    message:
                        "Passkey is not registered for this account",
                });

                return;
            }

            /* ----------------------------------------------------
               CREATE WEBAUTHN CREDENTIAL
            ---------------------------------------------------- */

            const credential =
                toWebAuthnCredential(
                    storedPasskey
                );

            let verification;

            try {
                verification =
                    await verifyAuthenticationResponse(
                        {
                            response,

                            expectedChallenge:
                                challenge.challenge,

                            expectedOrigin:
                                getExpectedOrigins(),

                            expectedRPID:
                                RP_ID,

                            credential,

                            requireUserVerification:
                                true,
                        }
                    );
            } catch (error) {
                console.error(
                    "PASSKEY AUTHENTICATION VERIFICATION ERROR:",
                    error
                );

                await WebAuthnChallenge.deleteOne(
                    {
                        _id:
                            challenge._id,
                    }
                );

                res.status(401).json({
                    message:
                        "Passkey authentication failed",
                });

                return;
            }

            await WebAuthnChallenge.deleteOne(
                {
                    _id:
                        challenge._id,
                }
            );

            if (
                !verification.verified
            ) {
                res.status(401).json({
                    message:
                        "Passkey authentication was not verified",
                });

                return;
            }

            /* ----------------------------------------------------
               UPDATE COUNTER
            ---------------------------------------------------- */

            storedPasskey.counter =
                verification
                    .authenticationInfo
                    .newCounter;

            await account.account.save();

            /* ====================================================
               EMPLOYEE LOGIN
            ==================================================== */

            if (
                account.type ===
                "employee"
            ) {
                const employee =
                    account.account;

                const session =
                    await createSession(
                        req,

                        employee
                            .residentIdNumber,

                        employee.name,

                        "employee"
                    );

                const token =
                    signToken({
                        userId:
                            employee
                                ._id
                                .toString(),

                        residentIdNumber:
                            employee
                                .residentIdNumber,

                        role:
                            "user",

                        sessionId:
                            session._id
                                .toString(),
                    });

                const data =
                    employee.toObject();

                delete data.password;

                delete data.avatarPublicId;

                delete data.iqamaPublicId;

                delete data.passkeys;

                res.json({
                    message:
                        "Passkey login successful",

                    token,

                    role:
                        "user",

                    accountType:
                        "employee",

                    user:
                        data,
                });

                return;
            }

            /* ====================================================
               ADMIN / SUPER ADMIN LOGIN
            ==================================================== */

            const admin =
                account.account;

            /*
             * IMPORTANT:
             *
             * Keep the real role exactly:
             *
             * Admin       → admin
             * Super Admin  → superadmin
             */

            const actualRole =
                admin.role ===
                    "superadmin"
                    ? "superadmin"
                    : "admin";

            const session =
                await createSession(
                    req,

                    admin.email,

                    admin.name,

                    actualRole
                );

            /* ----------------------------------------------------
               JWT
            ---------------------------------------------------- */

            const token =
                signToken({
                    userId:
                        admin._id
                            .toString(),

                    role:
                        actualRole,

                    sessionId:
                        session._id
                            .toString(),
                });

            /* ----------------------------------------------------
               RESPONSE
            ---------------------------------------------------- */

            res.json({
                message:
                    "Passkey login successful",

                token,

                role:
                    actualRole,

                accountType:
                    "admin",

                admin: {
                    id:
                        admin._id,

                    name:
                        admin.name,

                    email:
                        admin.email,

                    role:
                        actualRole,

                    active:
                        admin.active,
                },
            });
        } catch (error) {
            console.error(
                "PASSKEY LOGIN VERIFY ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Passkey login failed",
            });
        }
    };

/* ============================================================
   PASSKEY STATUS
============================================================ */

export const getPasskeyStatus =
    async (
        req: any,
        res: Response
    ): Promise<void> => {
        try {
            const account =
                await getAccountFromRequest(
                    req
                );

            if (!account) {
                res.status(401).json({
                    message:
                        "Authenticated account not found",
                });

                return;
            }

            const passkeys =
                (
                    account.account
                        .passkeys || []
                ) as IPasskey[];

            res.json({
                hasPasskey:
                    passkeys.length > 0,

                accountType:
                    account.type,

                ...(account.type ===
                    "admin"
                    ? {
                        role:
                            account.account
                                .role,
                    }
                    : {
                        role: "user",
                    }),
            });
        } catch (error) {
            console.error(
                "PASSKEY STATUS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to get passkey status",
            });
        }
    };