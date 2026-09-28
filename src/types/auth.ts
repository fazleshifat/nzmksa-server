import { Request } from "express";

export type UserRole = "user" | "admin";

export interface AuthPayload {
  userId: string;
  residentIdNumber?: string;
  role: UserRole;
  sessionId: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}