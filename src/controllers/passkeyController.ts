import { Request, Response } from "express";
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    type WebAuthnCredential,
} from "@simplewebauthn/server";

import { createSession } from "../utils/createSession";
import { signToken } from "../utils/token";
import { WebAuthnChallenge } from "../WebAuthnChallenge";
import { Employee, type IPasskey, } from "../models/Employee";

const RP_NAME = process.env.WEBAUTHN_RP_NAME || "Absher";

const RP_ID =
    process.env.WEBAUTHN_RP_ID || "absher-client.vercel.app";

const getExpectedOrigins = (): string[] => {
    const origins = process.env.WEBAUTHN_ORIGINS
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (origins && origins.length > 0) {
        return origins;
    }

    return ["https://absher-client.vercel.app"];
};

const CHALLENGE_EXPIRATION_MS = 5 * 60 * 1000;

const getEmployeeFromRequest = async (req: any) => {
    const employeeId = req.user?.userId;

    if (!employeeId) {
        return null;
    }

    return Employee.findById(employeeId).select("+password");
};

const saveChallenge = async (
    employeeId: string,
    challenge: string,
    type: "registration" | "authentication"
) => {
    await WebAuthnChallenge.deleteMany({
        employeeId,
        type,
    });

    const expiresAt = new Date(
        Date.now() + CHALLENGE_EXPIRATION_MS
    );

    return WebAuthnChallenge.create({
        employeeId,
        challenge,
        type,
        expiresAt,
    });
};

/* ============================================================
   REGISTER PASSKEY
============================================================ */

export const registerPasskeyOptions = async (
    req: any,
    res: Response
): Promise<void> => {
    try {
        if (req.user?.role !== "user") {
            res.status(403).json({
                message: "Only employees can register a passkey",
            });
            return;
        }

        const employee = await getEmployeeFromRequest(req);

        if (!employee) {
            res.status(404).json({
                message: "Employee not found",
            });
            return;
        }

        const existingPasskeys = employee?.passkeys || [];

        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,

            userName: employee.residentIdNumber,

            attestationType: "none",

            excludeCredentials: existingPasskeys.map((passkey: IPasskey) => ({
                id: passkey.credentialId,
                transports: passkey.transports as any,
            })),

            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "required",
                authenticatorAttachment: "platform",
            },
        });

        await saveChallenge(
            employee._id.toString(),
            options.challenge,
            "registration"
        );

        res.json(options);
    } catch (error) {
        console.error(
            "PASSKEY REGISTER OPTIONS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to create passkey registration options",
        });
    }
};

export const registerPasskeyVerify = async (
    req: any,
    res: Response
): Promise<void> => {
    try {
        if (req.user?.role !== "user") {
            res.status(403).json({
                message: "Only employees can register a passkey",
            });
            return;
        }

        const employee = await getEmployeeFromRequest(req);

        if (!employee) {
            res.status(404).json({
                message: "Employee not found",
            });
            return;
        }

        const challenge = await WebAuthnChallenge.findOne({
            employeeId: employee._id,
            type: "registration",
            expiresAt: {
                $gt: new Date(),
            },
        }).sort({
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
            verification = await verifyRegistrationResponse({
                response: req.body,

                expectedChallenge: challenge.challenge,

                expectedOrigin: getExpectedOrigins(),

                expectedRPID: RP_ID,

                requireUserVerification: true,
            });
        } catch (error) {
            console.error(
                "PASSKEY REGISTRATION VERIFICATION ERROR:",
                error
            );

            await WebAuthnChallenge.deleteOne({
                _id: challenge._id,
            });

            res.status(400).json({
                message: "Passkey registration verification failed",
            });

            return;
        }

        await WebAuthnChallenge.deleteOne({
            _id: challenge._id,
        });

        if (!verification.verified || !verification.registrationInfo) {
            res.status(400).json({
                message: "Passkey registration was not verified",
            });

            return;
        }

        const {
            credential,
            credentialDeviceType,
            credentialBackedUp,
        } = verification.registrationInfo;

        const existingCredential = employee.passkeys?.find(
            (passkey: IPasskey) =>
                passkey.credentialId === credential.id
        );

        if (existingCredential) {
            res.status(409).json({
                message: "This passkey is already registered",
            });
            return;
        }

        employee.passkeys = employee.passkeys || [];

        employee.passkeys.push({
            credentialId: credential.id,
            publicKey: Buffer.from(credential.publicKey),
            counter: credential.counter,
            transports: credential.transports as string[] | undefined,
            deviceType: credentialDeviceType,
            backedUp: credentialBackedUp,
        });

        await employee.save();

        res.json({
            verified: true,
            message: "Passkey registered successfully",
        });
    } catch (error) {
        console.error(
            "PASSKEY REGISTER VERIFY ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to register passkey",
        });
    }
};

/* ============================================================
   AUTHENTICATE WITH PASSKEY
============================================================ */

export const loginPasskeyOptions = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const residentIdNumber = String(
            req.body?.residentIdNumber || ""
        ).trim();

        if (!residentIdNumber) {
            res.status(400).json({
                message: "Resident ID number is required",
            });
            return;
        }

        const employee = await Employee.findOne({
            residentIdNumber,
        });

        if (!employee) {
            res.status(401).json({
                message: "Invalid credentials",
            });
            return;
        }

        const passkeys = employee.passkeys || [];

        if (passkeys.length === 0) {
            res.status(400).json({
                message: "No passkey is registered for this account",
            });
            return;
        }

        const options = await generateAuthenticationOptions({
            rpID: RP_ID,

            userVerification: "required",

            allowCredentials: passkeys.map((passkey: IPasskey) => ({
                id: passkey.credentialId,
                transports: passkey.transports as any,
            })),
        });

        await saveChallenge(
            employee._id.toString(),
            options.challenge,
            "authentication"
        );

        res.json(options);
    } catch (error) {
        console.error(
            "PASSKEY LOGIN OPTIONS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to create passkey login options",
        });
    }
};

export const loginPasskeyVerify = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const residentIdNumber = String(
            req.body?.residentIdNumber || ""
        ).trim();

        const response = req.body?.response;

        if (!residentIdNumber || !response) {
            res.status(400).json({
                message:
                    "Resident ID number and passkey response are required",
            });
            return;
        }

        const employee = await Employee.findOne({
            residentIdNumber,
        });

        if (!employee) {
            res.status(401).json({
                message: "Invalid credentials",
            });
            return;
        }

        const challenge = await WebAuthnChallenge.findOne({
            employeeId: employee._id,
            type: "authentication",
            expiresAt: {
                $gt: new Date(),
            },
        }).sort({
            createdAt: -1,
        });

        if (!challenge) {
            res.status(400).json({
                message:
                    "Passkey login session expired. Please try again.",
            });
            return;
        }

        const storedPasskey = employee.passkeys?.find(
            (passkey: IPasskey) =>
                passkey.credentialId === response.id
        );

        if (!storedPasskey) {
            await WebAuthnChallenge.deleteOne({
                _id: challenge._id,
            });

            res.status(401).json({
                message: "Passkey is not registered for this account",
            });

            return;
        }

        const credential: WebAuthnCredential = {
            id: storedPasskey.credentialId,

            publicKey: new Uint8Array(
                storedPasskey.publicKey
            ),

            counter: storedPasskey.counter,

            transports:
                storedPasskey.transports as any,
        };

        let verification;

        try {
            verification = await verifyAuthenticationResponse({
                response,

                expectedChallenge: challenge.challenge,

                expectedOrigin: getExpectedOrigins(),

                expectedRPID: RP_ID,

                credential,

                requireUserVerification: true,
            });
        } catch (error) {
            console.error(
                "PASSKEY AUTHENTICATION VERIFICATION ERROR:",
                error
            );

            await WebAuthnChallenge.deleteOne({
                _id: challenge._id,
            });

            res.status(401).json({
                message: "Passkey authentication failed",
            });

            return;
        }

        await WebAuthnChallenge.deleteOne({
            _id: challenge._id,
        });

        if (!verification.verified) {
            res.status(401).json({
                message: "Passkey authentication was not verified",
            });

            return;
        }

        storedPasskey.counter =
            verification.authenticationInfo.newCounter;

        await employee.save();

        const session = await createSession(
            req,
            employee.residentIdNumber,
            employee.name,
            "employee"
        );

        const token = signToken({
            userId: employee._id.toString(),
            residentIdNumber: employee.residentIdNumber,
            role: "user",
            sessionId: session._id.toString(),
        });

        const data = employee.toObject();

        delete data.password;
        delete data.avatarPublicId;
        delete data.iqamaPublicId;
        delete data.passkeys;

        res.json({
            message: "Passkey login successful",
            token,
            role: "user",
            user: data,
        });
    } catch (error) {
        console.error(
            "PASSKEY LOGIN VERIFY ERROR:",
            error
        );

        res.status(500).json({
            message: "Passkey login failed",
        });
    }
};