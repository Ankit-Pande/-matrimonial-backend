import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { razorpay, verifyPaymentSignature } from "../integration/razorpay";

// Discount ke baad kitne paise dene honge ye nikalta hai.
// Jaise 499 rupaye ka plan hai aur 50% off hai to 249.50 -> 249 hoga.
const discountedPrice = (pricePaise: number, discountPercent: number): number => {
  const bachat = Math.round((pricePaise * discountPercent) / 100);
  return pricePaise - bachat;
};

export const membershipService = {
  // Saare chalu plan laata hai (admin ne jo banaye).
  // Har plan me original price, discount aur final price hoti hai.
  async listPlans() {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { pricePaise: "asc" },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      pricePaise: plan.pricePaise,
      discountPercent: plan.discountPercent,
      finalPricePaise: discountedPrice(plan.pricePaise, plan.discountPercent),
      durationDays: plan.durationDays,
    }));
  },

  // Razorpay pe payment ka order banata hai.
  async createOrder(userId: string, planId: string) {
    // Plan DB se lo — band ya delete ho to order mat banao.
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new AppError("This plan is not available", 404);
    }

    const amount = discountedPrice(plan.pricePaise, plan.discountPercent);

    // Razorpay order (amount paise me — 499 rupaye = 49900 paise).
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `sub_${Date.now()}`,
    });

    // Pending subscription save karo. Plan ka naam snapshot rakho
    // taaki baad me plan badle/delete ho to bhi record sahi rahe.
    await prisma.subscription.create({
      data: {
        userId,
        razorpayOrderId: order.id,
        amount,
        planName: plan.name,
        status: "PENDING",
      },
    });

    return {
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  },

  // Payment hote hi frontend ye call karta hai (Razorpay se mili signature ke saath).
  // Signature sahi ho to turant premium — webhook ka intezaar nahi.
  async verifyPayment(userId: string, orderId: string, paymentId: string, signature: string) {
    const sub = await prisma.subscription.findUnique({
      where: { razorpayOrderId: orderId },
    });
    // Order usi user ka hona chahiye jo verify kar raha hai.
    if (!sub || sub.userId !== userId) {
      throw new AppError("Order not found", 404);
    }
    if (!verifyPaymentSignature(orderId, paymentId, signature)) {
      throw new AppError("Payment verification failed", 400);
    }
    await this.activateFromWebhook(orderId, paymentId, signature);
    return this.myMembership(userId);
  },

  // Payment hone par Razorpay webhook yahan call karta hai.
  // User ko premium banata hai. Same order dobara aaye to kuch nahi (double na ho).
  async activateFromWebhook(orderId: string, paymentId: string, signature: string) {
    const sub = await prisma.subscription.findUnique({
      where: { razorpayOrderId: orderId },
    });
    if (!sub) return;
    if (sub.status === "COMPLETED") return;

    // Plan ka naam snapshot se duration nikalo (plan delete ho gaya ho to bhi).
    const plan = await prisma.plan.findUnique({ where: { name: sub.planName } });
    const din = plan ? plan.durationDays : 30;

    const khatamHoga = new Date();
    khatamHoga.setDate(khatamHoga.getDate() + din);

    // Premium pehle se baaki hai to naye din uske upar jod do (renewal).
    const user = await prisma.user.findUnique({
      where: { id: sub.userId },
      select: { subscriptionExpiresAt: true },
    });
    if (user?.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date()) {
      khatamHoga.setTime(user.subscriptionExpiresAt.getTime());
      khatamHoga.setDate(khatamHoga.getDate() + din);
    }

    await prisma.$transaction([
      prisma.subscription.update({
        where: { razorpayOrderId: orderId },
        data: {
          status: "COMPLETED",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
      }),
      prisma.user.update({
        where: { id: sub.userId },
        data: { isPremium: true, subscriptionExpiresAt: khatamHoga },
      }),
    ]);
  },

  // Payment fail hone par subscription FAILED mark karta hai.
  async markFailed(orderId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { razorpayOrderId: orderId },
    });
    if (!sub || sub.status !== "PENDING") return;

    await prisma.subscription.update({
      where: { razorpayOrderId: orderId },
      data: { status: "FAILED" },
    });
  },

  // User ka premium status.
  async myMembership(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, subscriptionExpiresAt: true },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  },
};
