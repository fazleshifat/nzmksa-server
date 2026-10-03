import mongoose, {
    Document,
    Schema,
} from "mongoose";

export type WebAuthnChallengeType =
    | "registration"
    | "authentication";

export type WebAuthnAccountType =
    | "employee"
    | "admin";

export interface IWebAuthnChallenge
    extends Document {
    accountId: mongoose.Types.ObjectId;

    accountType: WebAuthnAccountType;

    challenge: string;

    type: WebAuthnChallengeType;

    expiresAt: Date;

    createdAt: Date;

    updatedAt: Date;
}

const webAuthnChallengeSchema =
    new Schema<IWebAuthnChallenge>(
        {
            accountId: {
                type: Schema.Types.ObjectId,
                required: true,
                index: true,
            },

            accountType: {
                type: String,
                enum: [
                    "employee",
                    "admin",
                ],
                required: true,
                index: true,
            },

            challenge: {
                type: String,
                required: true,
            },

            type: {
                type: String,
                enum: [
                    "registration",
                    "authentication",
                ],
                required: true,
            },

            expiresAt: {
                type: Date,
                required: true,
            },
        },
        {
            timestamps: true,
        }
    );

// Automatically delete expired challenges
webAuthnChallengeSchema.index(
    { expiresAt: 1 },
    {
        expireAfterSeconds: 0,
    }
);

export const WebAuthnChallenge =
    mongoose.models.WebAuthnChallenge ||
    mongoose.model<IWebAuthnChallenge>(
        "WebAuthnChallenge",
        webAuthnChallengeSchema
    );