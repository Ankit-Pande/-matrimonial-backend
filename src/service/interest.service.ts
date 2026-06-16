import { prisma } from "../config/db";
import { AppError } from "../utils/appError";

export const interestService = {
  // Express interest. Khud ko nahi, duplicate nahi (unique constraint bhi rok).
  async send(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new AppError("You cannot send interest to yourself", 400);
    }

    const target = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { isApproved: true, isBlocked: true, isDeleted: true },
    });
    if (!target || !target.isApproved || target.isBlocked || target.isDeleted) {
      throw new AppError("User not found", 404);
    }

    const existing = await prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
    });
    if (existing) throw new AppError("Interest already sent", 409);

    return prisma.interest.create({
      data: { fromUserId, toUserId },
    });
  },

  // Accept/Reject — sirf jisko interest mila wahi (toUser) respond kar sake.
  async respond(userId: string, interestId: string, action: "ACCEPT" | "REJECT") {
    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
    });
    if (!interest) throw new AppError("Interest not found", 404);
    if (interest.toUserId !== userId) {
      throw new AppError("You cannot respond to this interest", 403);
    }
    if (interest.status !== "PENDING") {
      throw new AppError("Interest already responded", 409);
    }

    return prisma.interest.update({
      where: { id: interestId },
      data: { status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" },
    });
  },

  // "Maine kisko bheja" — sent list (cursor pagination).
  async listSent(userId: string, cursor: string | undefined, limit: number) {
    const items = await prisma.interest.findMany({
      where: { fromUserId: userId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        toUser: { select: { id: true, profile: { select: { name: true, photos: true } } } },
      },
    });
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    return { interests: page, nextCursor: hasMore ? page[page.length - 1].id : null };
  },

  // "Mujhe kisne bheja" — received list.
  async listReceived(userId: string, cursor: string | undefined, limit: number) {
    const items = await prisma.interest.findMany({
      where: { toUserId: userId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: { select: { id: true, profile: { select: { name: true, photos: true } } } },
      },
    });
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    return { interests: page, nextCursor: hasMore ? page[page.length - 1].id : null };
  },
};
