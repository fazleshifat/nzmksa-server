import { Request } from "express";

export interface AuthPayload {
  userId: string;
  residentIdNumber: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}