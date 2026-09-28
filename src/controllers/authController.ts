import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Employee } from "../models/Employee";
import { Admin } from "../models/Admin";
import { signToken } from "../utils/token";
import { createSession } from "../utils/createSession";

const employeeResponse = (employee: any) => {
  const data = employee.toObject ? employee.toObject() : { ...employee };

  delete data.password;
  delete data.avatarPublicId;
  delete data.iqamaPublicId;

  return data;
};

const adminResponse = (admin: any) => {
  const data = admin.toObject ? admin.toObject() : { ...admin };

  delete data.password;

  return {
    id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    active: data.active,
  };
};

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
  } else if (ua.includes("safari/") && !ua.includes("chrome/")) {
    browser = "Safari";
  }

  return {
    device,
    browser,
    os,
  };
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { residentIdNumber, password, email } = req.body;

    const loginIdentifier = String(
      email || residentIdNumber || ""
    ).trim();

    if (!loginIdentifier || !password) {
      res.status(400).json({
        message: "Resident ID / Email and password are required",
      });
      return;
    }

    /*
     * ---------------------------------------------------------
     * 1. Try employee login
     * ---------------------------------------------------------
     */

    const employee = await Employee.findOne({
      residentIdNumber: loginIdentifier,
    }).select("+password");

    if (employee) {
      const validPassword = await bcrypt.compare(
        password,
        employee.password
      );

      if (!validPassword) {
        res.status(401).json({
          message: "Invalid credentials",
        });
        return;
      }

      const session = await createSession(
        req,
        employee.residentIdNumber,
        employee.name,
        "employee"
      );

      const token = signToken({
        userId: employee._id.toString(),
        residentIdNumber: employee.residentIdNumber,
        role: "user",
        sessionId: session._id.toString(),
      });

      res.json({
        message: "Login successful",
        token,
        role: "user",
        user: employeeResponse(employee),
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * 2. Try admin login
     * ---------------------------------------------------------
     */

    const admin = await Admin.findOne({
      email: loginIdentifier.toLowerCase(),
    }).select("+password");

    if (admin) {
      if (!admin.active) {
        res.status(403).json({
          message: "Admin account is inactive",
        });
        return;
      }

      const validPassword = await bcrypt.compare(
        password,
        admin.password
      );

      if (!validPassword) {
        res.status(401).json({
          message: "Invalid credentials",
        });
        return;
      }

      const session = await createSession(
        req,
        admin.email,
        admin.name,
        admin.role === "super_admin"
          ? "super_admin"
          : "admin"
      );

      const token = signToken({
        userId: admin._id.toString(),
        role: "admin",
        sessionId: session._id.toString(),
      });

      res.json({
        message: "Admin login successful",
        token,
        role: "admin",
        admin: adminResponse(admin),
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * 3. Nothing matched
     * ---------------------------------------------------------
     */

    res.status(401).json({
      message: "Invalid credentials",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

export const me = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    /*
     * ---------------------------------------------------------
     * Admin session
     * ---------------------------------------------------------
     */

    if (req.user.role === "admin") {
      const admin = await Admin.findById(req.user.userId);

      if (!admin) {
        res.status(404).json({
          message: "Admin not found",
        });
        return;
      }

      if (!admin.active) {
        res.status(403).json({
          message: "Admin account is inactive",
        });
        return;
      }

      res.json({
        admin: adminResponse(admin),
        role: "admin",
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * Normal user session
     * ---------------------------------------------------------
     */

    const employee = await Employee.findById(req.user.userId);

    if (!employee) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.json({
      user: employeeResponse(employee),
      role: "user",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load account",
    });
  }
};