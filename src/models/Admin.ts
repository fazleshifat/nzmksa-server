import mongoose, {
    Document,
    Schema,
} from "mongoose";

export type AdminRole =
    | "admin"
    | "superadmin";

export interface IAdminPasskey {
    credentialId: string;
    publicKey: Buffer;
    counter: number;
    transports?: string[];
    deviceType?: string;
    backedUp?: boolean;
}

export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    role: AdminRole;
    active: boolean;

    passkeys?: IAdminPasskey[];

    createdAt: Date;
    updatedAt: Date;
}

const passkeySchema =
    new Schema<IAdminPasskey>(
        {
            credentialId: {
                type: String,
                required: true,
            },

            publicKey: {
                type: Buffer,
                required: true,
            },

            counter: {
                type: Number,
                required: true,
                default: 0,
            },

            transports: {
                type: [String],
                default: undefined,
            },

            deviceType: {
                type: String,
            },

            backedUp: {
                type: Boolean,
                default: false,
            },
        },
        {
            _id: false,
        }
    );

const adminSchema =
    new Schema<IAdmin>(
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
                enum: [
                    "admin",
                    "superadmin",
                ],
                default: "admin",
                required: true,
            },

            active: {
                type: Boolean,
                default: true,
            },

            passkeys: {
                type: [passkeySchema],
                default: [],
            },
        },
        {
            timestamps: true,
            collection: "admins",
        }
    );

export const Admin =
    mongoose.models.Admin ||
    mongoose.model<IAdmin>(
        "Admin",
        adminSchema
    );