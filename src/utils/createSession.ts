import { Request } from "express";
import { Session } from "../models/Session";

type UserType = "employee" | "admin" | "super_admin";

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    const ip = forwardedFor.split(",")[0].trim();

    if (ip) {
      return ip;
    }
  }

  if (typeof req.headers["x-real-ip"] === "string") {
    return req.headers["x-real-ip"];
  }

  if (req.ip) {
    return req.ip;
  }

  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }

  return "Unknown";
};

const parseUserAgent = (userAgent: string) => {
  const ua = userAgent.toLowerCase();

  let device = "Desktop";

  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
    device = "Mobile";
  }

  let os = "Unknown";

  if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
  } else if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("mac os")) {
    os = "macOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  let browser = "Unknown";

  if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome/")) {
    browser = "Chrome";
  } else if (ua.includes("firefox/")) {
    browser = "Firefox";
  } else if (
    ua.includes("safari/") &&
    !ua.includes("chrome/")
  ) {
    browser = "Safari";
  }

  return {
    device,
    browser,
    os,
  };
};

export const createSession = async (
  req: Request,
  userId: string,
  name: string,
  userType: UserType
) => {
  const userAgent =
    req.headers["user-agent"] || "Unknown";

  const { device, browser, os } =
    parseUserAgent(userAgent);

  const ipAddress = getClientIp(req);

  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  const session = await Session.create({
    userId,
    name,
    userType,

    device,
    browser,
    os,
    ipAddress,

    lastActiveAt: new Date(),
    expiresAt,

    revoked: false,
  });

  return session;
};