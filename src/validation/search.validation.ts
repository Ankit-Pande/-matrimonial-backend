import { z } from "zod";

// Query params strings hote hain -> coerce. Sab filter optional.
const optStr = z.string().trim().optional();

export const searchSchema = z.object({
  query: z
    .object({
      // Filters
      religion: optStr,
      caste: optStr,
      maritalStatus: z
        .enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"])
        .optional(),
      professionType: z
        .enum(["GOVERNMENT", "BUSINESS", "PRIVATE", "NOT_WORKING"])
        .optional(),
      manglikStatus: z
        .enum(["MANGLIK", "NON_MANGLIK", "ANSHIK_MANGLIK", "DONT_KNOW"])
        .optional(),
      diet: z.enum(["VEG", "NON_VEG", "EGGETARIAN"]).optional(),
      motherTongue: optStr,
      state: optStr,
      city: optStr,
      gotra: optStr,

      // Range filters
      minAge: z.coerce.number().int().min(18).max(100).optional(),
      maxAge: z.coerce.number().int().min(18).max(100).optional(),
      minHeight: z.coerce.number().min(120).max(250).optional(),
      maxHeight: z.coerce.number().min(120).max(250).optional(),
      minIncome: z.coerce.number().min(0).optional(),

      // Pagination (cursor + limit)
      cursor: optStr, // last profile id
      limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strict(),
});

// search ke filters ka type — service me isi type ka data jaata hai (any nahi).
export type SearchFilters = z.infer<typeof searchSchema>["query"];
