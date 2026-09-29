import { Request } from "express";

export type UserRole =
  | "user"
  | "admin"
  | "superadmin";

export interface AuthPayload {
  userId: string;

  residentIdNumber?: string;

  role: UserRole;

  sessionId: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}