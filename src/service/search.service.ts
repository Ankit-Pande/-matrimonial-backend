import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { serializeProfile } from "../utils/serializer";
import { SearchFilters } from "../validation/search.validation";

// age -> dob range. minAge=25 matlab dob jitni "purani" honi chahiye.
const ageToDob = (age: number): Date => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  return d;
};

export const searchService = {
  // Searcher ke opposite gender ke approved+active profiles. Filters + cursor pagination.
  async search(viewerUserId: string, filters: SearchFilters) {
    const me = await prisma.profile.findUnique({
      where: { userId: viewerUserId },
      select: { gender: true },
    });
    if (!me) throw new AppError("Create your profile first to search", 400);

    const targetGender = me.gender === "MALE" ? "FEMALE" : "MALE";

    // dob range (maxAge -> earliest dob, minAge -> latest dob)
    const dobFilter: Prisma.DateTimeFilter = {};
    if (filters.maxAge) dobFilter.gte = ageToDob(filters.maxAge + 1);
    if (filters.minAge) dobFilter.lte = ageToDob(filters.minAge);

    const where: Prisma.ProfileWhereInput = {
      gender: targetGender,
      user: { isApproved: true, isBlocked: false, isDeleted: false },
      ...(filters.religion && { religion: filters.religion }),
      ...(filters.caste && { caste: filters.caste }),
      ...(filters.maritalStatus && { maritalStatus: filters.maritalStatus }),
      ...(filters.professionType && { professionType: filters.professionType }),
      ...(filters.manglikStatus && { manglikStatus: filters.manglikStatus }),
      ...(filters.diet && { diet: filters.diet }),
      ...(filters.motherTongue && { motherTongue: filters.motherTongue }),
      ...(filters.state && { state: filters.state }),
      ...(filters.city && { city: filters.city }),
      ...(filters.gotra && { gotra: filters.gotra }),
      ...(Object.keys(dobFilter).length && { dob: dobFilter }),
      ...((filters.minHeight || filters.maxHeight) && {
        height: {
          ...(filters.minHeight && { gte: filters.minHeight }),
          ...(filters.maxHeight && { lte: filters.maxHeight }),
        },
      }),
      ...(filters.minIncome && { annualIncome: { gte: filters.minIncome } }),
    };

    const limit = filters.limit ?? 20;

    // Cursor pagination: createdAt+id stable order. cursor = last id.
    const profiles = await prisma.profile.findMany({
      where,
      take: limit + 1, // 1 extra -> "next page hai ya nahi" pata chale
      ...(filters.cursor && { cursor: { id: filters.cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        partnerPreference: true,
        familyDetails: true,
        user: { select: { phone: true, isPremium: true } },
      },
    });

    const hasMore = profiles.length > limit;
    const page = hasMore ? profiles.slice(0, limit) : profiles;

    // Viewer premium? -> contact/photo privacy serializer decide karta hai.
    const viewer = await prisma.user.findUnique({
      where: { id: viewerUserId },
      select: { isPremium: true },
    });
    const isPremium = viewer?.isPremium ?? false;

    const data = page.map((p) =>
      serializeProfile(p, { isPremium, isMutualAccepted: false })
    );

    return {
      profiles: data,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  },

  // Ek profile detail dekhna (search se click). Privacy serializer + interest status.
  async getProfileById(viewerUserId: string, profileId: string) {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        partnerPreference: true,
        familyDetails: true,
        user: {
          select: { id: true, phone: true, isPremium: true, isApproved: true, isBlocked: true, isDeleted: true },
        },
      },
    });
    if (!profile || !profile.user.isApproved || profile.user.isBlocked || profile.user.isDeleted) {
      throw new AppError("Profile not found", 404);
    }

    const viewer = await prisma.user.findUnique({
      where: { id: viewerUserId },
      select: { isPremium: true },
    });

    // Mutual interest accepted? -> ON_REQUEST photo unlock ke liye.
    const accepted = await prisma.interest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { fromUserId: viewerUserId, toUserId: profile.user.id },
          { fromUserId: profile.user.id, toUserId: viewerUserId },
        ],
      },
      select: { id: true },
    });

    return serializeProfile(profile, {
      isPremium: viewer?.isPremium ?? false,
      isMutualAccepted: !!accepted,
    });
  },
};
