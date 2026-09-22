import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Employee } from "../models/Employee";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";


// iamges upload functions by ADMIN
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

export const uploadUserImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({
        message: "Image is required",
      });
      return;
    }

    const user = await Employee.findById(id);

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
      `${process.env.CLOUDINARY_FOLDER || "absher/employees"}` +
      `/${id}/${type}`;

    const result = await uploadBuffer(
      req.file.buffer,
      folder
    );

    const oldPublicId =
      type === "avatar"
        ? user.avatarPublicId
        : user.iqamaPublicId;

    // Delete previous image from Cloudinary
    if (oldPublicId) {
      await cloudinary.uploader.destroy(
        oldPublicId,
        {
          resource_type: "image",
        }
      );
    }

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
    });
  } catch (error) {
    console.error(
      "Admin image upload error:",
      error
    );

    res.status(500).json({
      message: "Image upload failed",
    });
  }
};

// ============================================================================
// GET ALL USERS
// ============================================================================

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await Employee.find()
      .select("-password -avatarPublicId -iqamaPublicId")
      .sort({ createdAt: -1 });

    res.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Admin get users error:", error);

    res.status(500).json({
      message: "Failed to load users",
    });
  }
};

// ============================================================================
// GET SINGLE USER
// ============================================================================

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await Employee.findById(id)
      .select("-password -avatarPublicId -iqamaPublicId");

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("Admin get user error:", error);

    res.status(500).json({
      message: "Failed to load user",
    });
  }
};

// ============================================================================
// CREATE USER
// ============================================================================

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      password,
      ...userData
    } = req.body;

    if (!userData.residentIdNumber) {
      res.status(400).json({
        message: "Resident ID number is required",
      });

      return;
    }

    if (!password) {
      res.status(400).json({
        message: "Password is required",
      });

      return;
    }

    const existingUser =
      await Employee.findOne({
        residentIdNumber:
          userData.residentIdNumber,
      });

    if (existingUser) {
      res.status(409).json({
        message:
          "A user with this resident ID already exists",
      });

      return;
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await Employee.create({
      ...userData,
      password: hashedPassword,
    });

    const responseUser =
      user.toObject();

    delete responseUser.password;
    delete responseUser.avatarPublicId;
    delete responseUser.iqamaPublicId;

    res.status(201).json({
      message: "User created successfully",
      user: responseUser,
    });
  } catch (error) {
    console.error("Admin create user error:", error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

// ============================================================================
// UPDATE USER
// ============================================================================

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const {
      password,
      _id,
      id: userId,
      createdAt,
      updatedAt,
      ...updates
    } = req.body;

    const user =
      await Employee.findById(id);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    // ----------------------------------------------------------
    // Check resident ID uniqueness if changed
    // ----------------------------------------------------------

    if (
      updates.residentIdNumber &&
      updates.residentIdNumber !==
      user.residentIdNumber
    ) {
      const existingUser =
        await Employee.findOne({
          residentIdNumber:
            updates.residentIdNumber,
          _id: {
            $ne: id,
          },
        });

      if (existingUser) {
        res.status(409).json({
          message:
            "Another user already has this resident ID",
        });

        return;
      }
    }

    // ----------------------------------------------------------
    // Update regular fields
    // ----------------------------------------------------------

    Object.assign(user, updates);

    // ----------------------------------------------------------
    // Password is intentionally handled separately
    // ----------------------------------------------------------

    if (password) {
      user.password =
        await bcrypt.hash(password, 12);
    }

    await user.save();

    const responseUser =
      user.toObject();

    delete responseUser.password;
    delete responseUser.avatarPublicId;
    delete responseUser.iqamaPublicId;

    res.json({
      message: "User updated successfully",
      user: responseUser,
    });
  } catch (error) {
    console.error("Admin update user error:", error);

    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

// ============================================================================
// DELETE USER
// ============================================================================

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user =
      await Employee.findById(id);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    await Employee.findByIdAndDelete(id);

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);

    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};