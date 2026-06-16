import { z } from "zod";

// Prisma enums se match (string literal — zod ko prisma enum nahi pata).
const gender = z.enum(["MALE", "FEMALE"]);
const maritalStatus = z.enum([
  "NEVER_MARRIED",
  "DIVORCED",
  "WIDOWED",
  "AWAITING_DIVORCE",
]);
const manglikStatus = z.enum([
  "MANGLIK",
  "NON_MANGLIK",
  "ANSHIK_MANGLIK",
  "DONT_KNOW",
]);
const professionType = z.enum([
  "GOVERNMENT",
  "BUSINESS",
  "PRIVATE",
  "NOT_WORKING",
]);
const diet = z.enum(["VEG", "NON_VEG", "EGGETARIAN"]);
const photoPrivacy = z.enum(["PUBLIC", "PREMIUM_ONLY", "ON_REQUEST"]);

// DOB: 18-100 saal ke beech (matrimonial legal age check).
const dob = z.coerce.date().refine(
  (d) => {
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 18 && age <= 100;
  },
  { message: "Age must be between 18 and 100" }
);

const familyDetails = z
  .object({
    fatherName: z.string().trim().max(100).optional(),
    fatherStatus: z.string().trim().max(100).optional(),
    motherName: z.string().trim().max(100).optional(),
    motherStatus: z.string().trim().max(100).optional(),
    totalBrothers: z.number().int().min(0).max(20).optional(),
    marriedBrothers: z.number().int().min(0).max(20).optional(),
    totalSisters: z.number().int().min(0).max(20).optional(),
    marriedSisters: z.number().int().min(0).max(20).optional(),
    familyValues: z.string().trim().max(50).optional(),
    familyIncome: z.number().min(0).optional(),
    nativePlace: z.string().trim().max(100).optional(),
  })
  .strict();

const partnerPreference = z
  .object({
    minAge: z.number().int().min(18).max(100).optional(),
    maxAge: z.number().int().min(18).max(100).optional(),
    minHeight: z.number().min(120).max(250).optional(),
    maxHeight: z.number().min(120).max(250).optional(),
    preferredCaste: z.string().trim().max(50).optional(),
    preferredCity: z.string().trim().max(50).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .strict();

// Profile create — saari required fields.
export const createProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100),
      gender,
      dob,
      maritalStatus: maritalStatus.optional(),
      motherTongue: z.string().trim().min(2).max(50),
      religion: z.string().trim().min(2).max(50).optional(),
      caste: z.string().trim().min(1).max(50),
      gotra: z.string().trim().max(50).optional(),
      manglikStatus: manglikStatus.optional(),
      diet: diet.optional(),
      height: z.number().min(120).max(250), // cm
      weight: z.number().int().min(30).max(200), // kg
      education: z.string().trim().min(1).max(100),
      professionType: professionType.optional(),
      jobTitle: z.string().trim().max(100).optional(),
      companyName: z.string().trim().max(100).optional(),
      annualIncome: z.number().min(0).optional(),
      state: z.string().trim().min(2).max(50),
      city: z.string().trim().min(2).max(50),
      aboutMe: z.string().trim().max(1000).optional(),
      photoPrivacy: photoPrivacy.optional(),
      familyDetails: familyDetails.optional(),
      partnerPreference: partnerPreference.optional(),
    })
    .strict(),
});

// Update — sab optional (jo bheja wahi update).
export const updateProfileSchema = z.object({
  body: createProfileSchema.shape.body.partial(),
});

// Privacy setting alag se badalne ke liye.
export const updatePrivacySchema = z.object({
  body: z.object({ photoPrivacy }).strict(),
});

// Photo delete — kaunsi URL hatani hai.
export const deletePhotoSchema = z.object({
  body: z.object({ url: z.string().url("Invalid photo URL") }).strict(),
});

// Service ke liye types (any ki jagah ye use hote hain).
export type CreateProfileInput = z.infer<typeof createProfileSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
