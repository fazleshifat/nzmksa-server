import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Employee } from "../models/Employee";
import { Admin } from "../models/Admin";
import { signToken } from "../utils/token";

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

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { residentIdNumber, password, email } = req.body;

    /*
     * The existing frontend sends `residentIdNumber`.
     *
     * We will treat that field as:
     * - Resident ID for normal users
     * - Email for admins
     *
     * We also accept `email` in case the frontend sends that later.
     */
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
     * 1. Try normal user login
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

      const token = signToken({
        userId: employee._id.toString(),
        residentIdNumber: employee.residentIdNumber,
        role: "user",
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
     * 2. If no user found, try admin login
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

      const token = signToken({
        userId: admin._id.toString(),
        role: "admin",
      });

      res.json({
        message: "Login successful",
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
    console.error(error);

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