import { Request, Response } from "express";
import { adminService } from "../service/admin.service";
import { userService } from "../service/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

// Dashboard counts.
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.stats();
  res.json({ success: true, stats });
});

// Users list (filter query ke saath).
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await adminService.listUsers({
    role: req.query.role as string | undefined,
    isApproved: req.query.isApproved as string | undefined,
    isBlocked: req.query.isBlocked as string | undefined,
  });
  res.json({ success: true, users });
});

export const approveUser = asyncHandler(async (req: Request, res: Response) => {
  await adminService.approveUser(req.params.id);
  res.json({ success: true, message: "User approved" });
});

export const toggleBlock = asyncHandler(async (req: Request, res: Response) => {
  await adminService.toggleBlock(req.user!.userId, req.params.id);
  res.json({ success: true, message: "Status updated" });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteUser(req.user!.userId, req.params.id);
  res.json({ success: true, message: "User deleted" });
});

export const makeAdmin = asyncHandler(async (req: Request, res: Response) => {
  await adminService.makeAdmin(req.params.id);
  res.json({ success: true, message: "Made admin" });
});

export const removeAdmin = asyncHandler(async (req: Request, res: Response) => {
  await adminService.removeAdmin(req.params.id);
  res.json({ success: true, message: "Admin removed" });
});

export const addProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.addProfile(req.body);
  res.status(201).json({ success: true, user });
});

// Bulk import — CSV se aayi rows.
export const bulkAddProfiles = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.bulkAddProfiles(req.body.rows);
  res.status(201).json({ success: true, ...result });
});

// Admin kisi member ke profile pe photo daale (userId se).
export const addProfilePhoto = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File & { path: string };
  if (!file) throw new AppError("No photo uploaded", 400);
  const result = await userService.addPhoto(req.params.userId, file.path);
  res.status(201).json({ success: true, ...result });
});

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await adminService.listPlans();
  res.json({ success: true, plans });
});

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await adminService.createPlan(req.body);
  res.status(201).json({ success: true, plan });
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await adminService.updatePlan(req.params.id, req.body);
  res.json({ success: true, plan });
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deletePlan(req.params.id);
  res.json({ success: true, message: "Plan deleted" });
});
