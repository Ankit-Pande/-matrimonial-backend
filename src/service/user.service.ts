import { Prisma, PhotoPrivacy } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import {
  CreateProfileInput,
  UpdateProfileInput,
} from "../validation/user.validation";

// Profile ko relations ke saath fetch karne ka standard shape.
const profileInclude = {
  partnerPreference: true,
  familyDetails: true,
  user: { select: { phone: true, isPremium: true } },
} satisfies Prisma.ProfileInclude;

export const userService = {
  // Apna profile dekhna (sab kuch — owner ko apna contact/photo dikhega).
  async getMyProfile(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: profileInclude,
    });
    if (!profile) throw new AppError("Profile not found", 404);
    return profile;
  },

  // Profile create (ek user ka ek hi profile). Nested family + preference saath.
  async createProfile(userId: string, data: CreateProfileInput) {
    const existing = await prisma.profile.findUnique({ where: { userId } });
    if (existing) throw new AppError("Profile already exists", 409);

    const { familyDetails, partnerPreference, ...profileData } = data;

    const profile = await prisma.profile.create({
      data: {
        ...profileData,
        userId,
        familyDetails: familyDetails ? { create: familyDetails } : undefined,
        partnerPreference: partnerPreference
          ? { create: partnerPreference }
          : undefined,
      },
      include: profileInclude,
    });

    return profile;
  },

  // Update — nested ko upsert (ho to update, na ho to create).
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new AppError("Profile not found", 404);

    const { familyDetails, partnerPreference, ...profileData } = data;

    const updated = await prisma.profile.update({
      where: { userId },
      data: {
        ...profileData,
        familyDetails: familyDetails
          ? { upsert: { create: familyDetails, update: familyDetails } }
          : undefined,
        partnerPreference: partnerPreference
          ? { upsert: { create: partnerPreference, update: partnerPreference } }
          : undefined,
      },
      include: profileInclude,
    });

    return updated;
  },

  async updatePrivacy(userId: string, photoPrivacy: PhotoPrivacy) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new AppError("Profile not found", 404);
    return prisma.profile.update({
      where: { userId },
      data: { photoPrivacy: photoPrivacy as PhotoPrivacy },
      select: { id: true, photoPrivacy: true },
    });
  },

  // Photo add — Cloudinary URL DB ke array me. Max 5 photos.
  async addPhoto(userId: string, url: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { photos: true },
    });
    if (!profile) throw new AppError("Profile not found", 404);
    if (profile.photos.length >= 5) {
      throw new AppError("Maximum 5 photos allowed", 400);
    }
    return prisma.profile.update({
      where: { userId },
      data: { photos: { push: url } },
      select: { photos: true },
    });
  },

  // Photo remove by URL.
  async removePhoto(userId: string, url: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { photos: true },
    });
    if (!profile) throw new AppError("Profile not found", 404);
    const updated = profile.photos.filter((p) => p !== url);
    if (updated.length === profile.photos.length) {
      throw new AppError("Photo not found", 404);
    }
    return prisma.profile.update({
      where: { userId },
      data: { photos: updated },
      select: { photos: true },
    });
  },
};
