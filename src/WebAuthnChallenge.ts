import mongoose, { Document, Schema } from "mongoose";

export type WebAuthnChallengeType =
  | "registration"
  | "authentication";

export interface IWebAuthnChallenge extends Document {
  employeeId: mongoose.Types.ObjectId;
  challenge: string;
  type: WebAuthnChallengeType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const webAuthnChallengeSchema =
  new Schema<IWebAuthnChallenge>(
    {
      employeeId: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
        index: true,
      },

      challenge: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        enum: ["registration", "authentication"],
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

// Automatically remove expired challenges
webAuthnChallengeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export const WebAuthnChallenge =
  mongoose.models.WebAuthnChallenge ||
  mongoose.model<IWebAuthnChallenge>(
    "WebAuthnChallenge",
    webAuthnChallengeSchema
  );