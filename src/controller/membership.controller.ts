import { Request, Response } from "express";
import { membershipService } from "../service/membership.service";
import { verifyWebhookSignature } from "../integration/razorpay";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { logger } from "../config/winston";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await membershipService.createOrder(
    req.user!.userId,
    req.body.planId
  );
  res.status(201).json({ success: true, ...result });
});

export const myMembership = asyncHandler(
  async (req: Request, res: Response) => {
    const membership = await membershipService.myMembership(req.user!.userId);
    res.json({ success: true, membership });
  }
);

// Frontend membership page ke liye — active plans + final price (discount lagke).
export const getPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await membershipService.listPlans();
  res.json({ success: true, plans });
});

// Razorpay webhook — NO auth (Razorpay call karta hai). Signature se verify hota hai.
// app.ts me is route pe RAW body parser lagta hai (signature raw body pe banta hai).
export const razorpayWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    const rawBody = req.body as Buffer; // raw parser se Buffer

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      throw new AppError("Invalid webhook signature", 400);
    }

    const event = JSON.parse(rawBody.toString());
    const payment = event?.payload?.payment?.entity;

    if (event.event === "payment.captured" && payment) {
      await membershipService.activateFromWebhook(
        payment.order_id,
        payment.id,
        signature
      );
    } else if (event.event === "payment.failed" && payment) {
      await membershipService.markFailed(payment.order_id);
    }

    logger.info(`Razorpay webhook: ${event.event}`);
    // Razorpay ko hamesha 200 do (warna retry karta rahega) — fail bhi log ho chuka.
    res.json({ success: true });
  }
);

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, paymentId, signature } = req.body;
  const membership = await membershipService.verifyPayment(
    req.user!.userId, orderId, paymentId, signature
  );
  res.json({ success: true, membership });
});
