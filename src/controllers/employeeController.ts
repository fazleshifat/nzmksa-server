import { Response } from "express";
import { Employee } from "../models/Employee";
import { AuthRequest } from "../types/auth";

const clean = (employee: any) => {
  const data = employee.toObject ? employee.toObject() : { ...employee };
  delete data.password;
  delete data.avatarPublicId;
  delete data.iqamaPublicId;
  return data;
};

export const getMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const employee = await Employee.findById(req.user!.userId);

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    res.json({ employee: clean(employee) });
  } catch {
    res.status(500).json({ message: "Failed to load profile" });
  }
};

export const listEmployees = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const employees = await Employee.find().sort({ name: 1 });

    res.json({
      count: employees.length,
      employees: employees.map(clean),
    });
  } catch {
    res.status(500).json({ message: "Failed to load employees" });
  }
};