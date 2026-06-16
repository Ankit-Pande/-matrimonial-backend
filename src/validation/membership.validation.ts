import { z } from "zod";

// Order banane ke liye plan ki id chahiye (admin ke banaye plans me se).
export const createOrderSchema = z.object({
  body: z.object({ planId: z.string().uuid() }).strict(),
});

// Payment ke baad verify (Razorpay handler se aata hai).
export const verifyPaymentSchema = z.object({
  body: z
    .object({
      orderId: z.string().min(1),
      paymentId: z.string().min(1),
      signature: z.string().min(1),
    })
    .strict(),
});
