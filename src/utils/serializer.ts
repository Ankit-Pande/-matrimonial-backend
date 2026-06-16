import { Prisma } from "@prisma/client";

// Yahan matrimonial ki privacy lagti hai (sabse zaroori cheez).
// DB se aaya profile seedha bhejna mana hai — contact number aur photo
// dekhne wale ke premium/relation pe depend karte hain.
//
// Rule (Shaadi/Matrimony jaisa):
//  - Contact number: sirf premium dekhe. Free wale ko kabhi nahi.
//  - Photo: photoPrivacy field pe depend —
//      PUBLIC        -> sabko dikhe
//      PREMIUM_ONLY  -> sirf premium ko (default)
//      ON_REQUEST    -> tabhi jab dono me interest ACCEPTED ho

// Profile ke saath uske rishte (partner pref, family, user) bhi chahiye.
// Ye type Prisma se hi banta hai taaki naam kabhi galat na ho.
const profileWithRelations = Prisma.validator<Prisma.ProfileDefaultArgs>()({
  include: {
    partnerPreference: true,
    familyDetails: true,
    user: { select: { phone: true, isPremium: true } },
  },
});

type ProfileFull = Prisma.ProfileGetPayload<typeof profileWithRelations>;

// Dekhne wale ka context — premium hai ya nahi, aur dono me interest accepted hai ya nahi.
interface ViewerContext {
  isPremium: boolean;
  isMutualAccepted: boolean;
}

export const serializeProfile = (profile: ProfileFull, viewer: ViewerContext) => {
  // Photo dikhe ya nahi — privacy rule ke hisaab se.
  const canSeePhoto =
    profile.photoPrivacy === "PUBLIC" ||
    (profile.photoPrivacy === "PREMIUM_ONLY" && viewer.isPremium) ||
    (profile.photoPrivacy === "ON_REQUEST" && viewer.isMutualAccepted);

  // Contact sirf premium ko.
  const canSeeContact = viewer.isPremium;

  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    age: calcAge(profile.dob),
    height: profile.height,
    weight: profile.weight,
    religion: profile.religion,
    caste: profile.caste,
    gotra: profile.gotra,
    manglikStatus: profile.manglikStatus,
    diet: profile.diet,
    maritalStatus: profile.maritalStatus,
    motherTongue: profile.motherTongue,
    education: profile.education,
    professionType: profile.professionType,
    jobTitle: profile.jobTitle,
    companyName: profile.companyName,
    annualIncome: profile.annualIncome,
    city: profile.city,
    state: profile.state,
    aboutMe: profile.aboutMe,
    familyDetails: profile.familyDetails,
    partnerPreference: profile.partnerPreference,
    // Photo allowed ho to hi URLs bhejo, warna khaali aur locked true.
    photos: canSeePhoto ? profile.photos : [],
    photoLocked: !canSeePhoto,
    contactNumber: canSeeContact ? profile.user.phone : null,
    contactLocked: !canSeeContact,
    // Profile owner premium hai ya nahi — frontend blue tick ke liye.
    isPremiumMember: profile.user.isPremium,
  };
};

// dob se umar nikalta hai.
const calcAge = (dob: Date): number => {
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};
