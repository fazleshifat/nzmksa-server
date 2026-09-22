import { Response } from "express";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { Employee } from "../models/Employee";
import { AuthRequest } from "../types/auth";

const uploadBuffer = (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });

export const uploadEmployeeImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Image is required" });
      return;
    }

    const employee = await Employee.findById(req.user!.userId);

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    const type = req.body.type === "iqama" ? "iqama" : "avatar";
    const folder = `${process.env.CLOUDINARY_FOLDER || "absher/employees"}/${type}`;

    const result = await uploadBuffer(req.file.buffer, folder);

    const oldPublicId =
      type === "avatar" ? employee.avatarPublicId : employee.iqamaPublicId;

    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: "image",
      });
    }

    if (type === "avatar") {
      employee.avatarUrl = result.secure_url;
      employee.avatarPublicId = result.public_id;
    } else {
      employee.iqamaImage = result.secure_url;
      employee.iqamaPublicId = result.public_id;
    }

    await employee.save();

    res.json({
      message: `${type} uploaded successfully`,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image upload failed" });
  }
};