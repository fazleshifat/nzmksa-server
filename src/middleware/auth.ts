import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { verifyToken } from "../utils/token";

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = header.split(" ")[1];
    req.user = verifyToken(token);

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};