import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Employee } from "../models/Employee";
import { signToken } from "../utils/token";

const employeeResponse = (employee: any) => {
  const data = employee.toObject ? employee.toObject() : { ...employee };
  delete data.password;
  delete data.avatarPublicId;
  delete data.iqamaPublicId;
  return data;
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { residentIdNumber, password } = req.body;

    if (!residentIdNumber || !password) {
      res.status(400).json({
        message: "Resident ID Number and password are required",
      });
      return;
    }

    const employee = await Employee.findOne({
      residentIdNumber: String(residentIdNumber).trim(),
    }).select("+password");

    if (!employee) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const validPassword = await bcrypt.compare(password, employee.password);

    if (!validPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken({
      userId: employee._id.toString(),
      residentIdNumber: employee.residentIdNumber,
    });

    res.json({
      message: "Login successful",
      token,
      employee: employeeResponse(employee),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const me = async (req: any, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.user.userId);

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    res.json({ employee: employeeResponse(employee) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load employee" });
  }
};