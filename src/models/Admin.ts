import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    role: "admin";
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ["admin"],
            default: "admin",
            required: true,
        },

        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "admins",
    }
);

export const Admin =
    mongoose.models.Admin ||
    mongoose.model<IAdmin>("Admin", adminSchema);