import { Request, Response } from "express";
import { searchService } from "../service/search.service";
import { asyncHandler } from "../utils/asyncHandler";

export const searchProfiles = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await searchService.search(req.user!.userId, req.query as unknown as Parameters<typeof searchService.search>[1]);
    res.json({ success: true, ...result });
  }
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await searchService.getProfileById(
    req.user!.userId,
    req.params.id
  );
  res.json({ success: true, profile });
});
