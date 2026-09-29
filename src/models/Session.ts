import mongoose, { Document, Schema } from "mongoose";

export type SessionUserType =
    | "employee"
    | "admin"
    | "superadmin";

export interface ISession extends Document {
    userId: string;
    name: string;
    userType: SessionUserType;

    device: string;
    browser: string;
    os: string;

    ipAddress: string;

    location?: {
        country?: string;
        city?: string;
        region?: string;
    };

    createdAt: Date;
    lastActiveAt: Date;
    expiresAt: Date;

    loggedOutAt?: Date;

    revoked: boolean;
}

const sessionSchema = new Schema<ISession>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
        },

        userType: {
            type: String,
            enum: [
                "employee",
                "admin",
                "superadmin",
            ],
            required: true,
            index: true,
        },

        device: {
            type: String,
            default: "Unknown",
        },

        browser: {
            type: String,
            default: "Unknown",
        },

        os: {
            type: String,
            default: "Unknown",
        },

        ipAddress: {
            type: String,
            default: "Unknown",
        },

        location: {
            country: String,
            city: String,
            region: String,
        },

        lastActiveAt: {
            type: Date,
            default: Date.now,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        loggedOutAt: {
            type: Date,
        },

        revoked: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Session =
    mongoose.models.Session ||
    mongoose.model<ISession>(
        "Session",
        sessionSchema
    );