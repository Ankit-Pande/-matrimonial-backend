import { Request, Response } from "express";
import { PhotoPrivacy } from "@prisma/client";
import { userService } from "../service/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await userService.getMyProfile(req.user!.userId);
    res.json({ success: true, profile });
  }
);

export const createProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await userService.createProfile(req.user!.userId, req.body);
    res.status(201).json({ success: true, profile });
  }
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await userService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, profile });
  }
);

export const updatePrivacy = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await userService.updatePrivacy(
      req.user!.userId,
      req.body.photoPrivacy as PhotoPrivacy
    );
    res.json({ success: true, ...result });
  }
);

// Photo: multer (storage.ts) Cloudinary pe upload kar deta hai, file.path me URL aata hai.
export const uploadPhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File & { path: string };
    if (!file) throw new AppError("No photo uploaded", 400);
    const result = await userService.addPhoto(req.user!.userId, file.path);
    res.status(201).json({ success: true, ...result });
  }
);

export const deletePhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const { url } = req.body;
    const result = await userService.removePhoto(req.user!.userId, url);
    res.json({ success: true, ...result });
  }
);
