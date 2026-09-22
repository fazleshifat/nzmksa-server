import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/auth";

export const signToken = (payload: AuthPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): AuthPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.verify(token, secret) as AuthPayload;
};