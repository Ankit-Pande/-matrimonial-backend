import { z } from "zod";

export const sendInterestSchema = z.object({
  body: z.object({ toUserId: z.string().uuid("Invalid user id") }).strict(),
});

export const respondInterestSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid interest id") }),
  body: z.object({ action: z.enum(["ACCEPT", "REJECT"]) }).strict(),
});

export const listInterestSchema = z.object({
  query: z
    .object({
      cursor: z.string().uuid().optional(),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strict(),
});

// list (sent/received) ke query ka type — controller me any ki jagah.
export type ListInterestQuery = z.infer<typeof listInterestSchema>["query"];
