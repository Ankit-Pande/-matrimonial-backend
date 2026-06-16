import { z } from "zod";
import { createProfileSchema } from "./user.validation";

// Admin profile add kare to user wale saare fields + optional phone.
export const bulkProfileSchema = z.object({
  body: z.object({
    rows: z.array(createProfileSchema.shape.body.extend({
      phone: z.string().trim().min(10).max(15).optional(),
    })).min(1).max(500),
  }).strict(),
});

export const addProfileSchema = z.object({
  body: createProfileSchema.shape.body.extend({
    phone: z.string().trim().min(10).max(15).optional(),
  }),
});

// Naya plan banane ke liye.
export const createPlanSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(40),
      pricePaise: z.number().int().min(0),
      discountPercent: z.number().int().min(0).max(100),
      durationDays: z.number().int().min(1).max(3650),
    })
    .strict(),
});

// Plan update.
export const updatePlanSchema = z.object({
  body: z
    .object({
      pricePaise: z.number().int().min(0),
      discountPercent: z.number().int().min(0).max(100),
      durationDays: z.number().int().min(1).max(3650),
      isActive: z.boolean(),
    })
    .strict(),
});

// Users list ke filters (optional).
export const listUsersSchema = z.object({
  query: z
    .object({
      role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
      isApproved: z.enum(["true", "false"]).optional(),
      isBlocked: z.enum(["true", "false"]).optional(),
    })
    .strict()
    .optional(),
});

export type AddProfileInput = z.infer<typeof addProfileSchema>["body"];
