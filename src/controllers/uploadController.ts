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
          reject(
            error || new Error("Cloudinary upload failed")
          );
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
      res.status(400).json({
        message: "Image is required",
      });
      return;
    }

    /*
     * Admin can upload for another user.
     * Normal user can only upload for themselves.
     */
    const isAdmin = req.user?.role === "admin";

    const targetUserId = isAdmin
      ? req.params.id
      : req.user?.userId;

    if (!targetUserId) {
      res.status(400).json({
        message: "User ID is required",
      });
      return;
    }

    const user = await Employee.findById(targetUserId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const type =
      req.body.type === "iqama"
        ? "iqama"
        : "avatar";

    const folder =
      `${
        process.env.CLOUDINARY_FOLDER ||
        "absher/employees"
      }/${targetUserId}/${type}`;

    const result = await uploadBuffer(
      req.file.buffer,
      folder
    );

    /*
     * Delete old image after successful upload.
     */
    const oldPublicId =
      type === "avatar"
        ? user.avatarPublicId
        : user.iqamaPublicId;

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(
          oldPublicId,
          {
            resource_type: "image",
          }
        );
      } catch (deleteError) {
        console.error(
          "Old Cloudinary image deletion failed:",
          deleteError
        );
      }
    }

    /*
     * Save new image.
     */
    if (type === "avatar") {
      user.avatarUrl = result.secure_url;
      user.avatarPublicId = result.public_id;
    } else {
      user.iqamaImage = result.secure_url;
      user.iqamaPublicId = result.public_id;
    }

    await user.save();

    res.json({
      message: `${type} uploaded successfully`,
      url: result.secure_url,
      publicId: result.public_id,
      type,
      userId: user._id,
    });
  } catch (error) {
    console.error(
      "Employee image upload error:",
      error
    );

    res.status(500).json({
      message: "Image upload failed",
    });
  }
};