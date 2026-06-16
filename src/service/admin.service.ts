import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { AddProfileInput } from "../validation/admin.validation";

// Admin ka saara kaam yahan — users, profiles, plans manage karna.

export const adminService = {
  // Dashboard ke counts.
  async stats() {
    const [total, premium, pending, blocked] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.user.count({ where: { isApproved: false, isDeleted: false } }),
      prisma.user.count({ where: { isBlocked: true } }),
    ]);
    return { total, premium, pending, blocked };
  },

  // Saare users (filter ke saath, naye pehle).
  async listUsers(filters: { role?: string; isApproved?: string; isBlocked?: string }) {
    return prisma.user.findMany({
      where: {
        isDeleted: false,
        ...(filters.role ? { role: filters.role as "USER" | "ADMIN" | "SUPER_ADMIN" } : {}),
        ...(filters.isApproved ? { isApproved: filters.isApproved === "true" } : {}),
        ...(filters.isBlocked ? { isBlocked: filters.isBlocked === "true" } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { profile: { select: { name: true, city: true, gender: true } } },
    });
  },

  // User ko approve karo.
  async approveUser(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { isApproved: true } });
  },

  // Block/unblock toggle. Apna account ya super admin block nahi kar sakte.
  async toggleBlock(adminId: string, userId: string) {
    if (adminId === userId) throw new AppError("You cannot block your own account", 400);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    if (user.role === "SUPER_ADMIN") throw new AppError("Super admin cannot be blocked", 403);
    await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked },
    });
  },

  // Soft delete. Apna account ya super admin delete nahi kar sakte.
  async deleteUser(adminId: string, userId: string) {
    if (adminId === userId) throw new AppError("You cannot delete your own account", 400);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    if (user.role === "SUPER_ADMIN") throw new AppError("Super admin cannot be deleted", 403);
    await prisma.user.update({ where: { id: userId }, data: { isDeleted: true } });
  },

  // Kisi user ko admin banao (sirf super admin kar sakta hai — route pe check hai).
  async makeAdmin(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  },

  // Admin se wapas normal user banao.
  async removeAdmin(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { role: "USER" } });
  },

  // Admin khud profile add kare (walk-in member). Phone optional.
  async addProfile(data: AddProfileInput) {
    const { phone, ...profileData } = data;
    const userPhone = phone ?? `bureau_${Date.now()}`;

    const existing = await prisma.user.findUnique({ where: { phone: userPhone } });
    if (existing) throw new AppError("A user with this phone number already exists", 409);

    const { partnerPreference, familyDetails, ...coreProfileData } = profileData as Record<string, unknown>;

    return prisma.user.create({
      data: {
        phone: userPhone,
        role: "USER",
        isApproved: true,
        profile: {
          create: {
            ...(coreProfileData as object),
            ...(partnerPreference ? { partnerPreference: { create: partnerPreference as object } } : {}),
            ...(familyDetails ? { familyDetails: { create: familyDetails as object } } : {}),
          },
        },
      },
      include: { profile: true },
    });
  },

  // Bulk import — ek saath bahut profile (CSV se). Har row ke liye user+profile.
  // Galat rows skip, sahi count + errors wapas. Phone na ho to bureau record.
  async bulkAddProfiles(rows: AddProfileInput[]) {
    let added = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        await this.addProfile(rows[i]);
        added++;
      } catch (err) {
        const msg = err instanceof AppError ? err.message : "invalid data";
        errors.push(`Row ${i + 2}: ${msg}`);
      }
    }
    return { added, failed: errors.length, errors };
  },

  async listPlans() {
    return prisma.plan.findMany({ orderBy: { pricePaise: "asc" } });
  },

  // Naya plan banao (jaise "2 Month Offer", 600 rupaye, 60 din).
  async createPlan(data: { name: string; pricePaise: number; discountPercent: number; durationDays: number }) {
    const existing = await prisma.plan.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError("A plan with this name already exists", 409);
    return prisma.plan.create({ data });
  },

  // Plan update (price, discount, duration, active/inactive).
  async updatePlan(id: string, data: { pricePaise: number; discountPercent: number; durationDays: number; isActive: boolean }) {
    return prisma.plan.update({ where: { id }, data });
  },

  // Plan delete.
  async deletePlan(id: string) {
    await prisma.plan.delete({ where: { id } });
  },
};
