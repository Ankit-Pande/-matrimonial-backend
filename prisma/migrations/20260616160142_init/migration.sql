-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE');

-- CreateEnum
CREATE TYPE "ManglikStatus" AS ENUM ('MANGLIK', 'NON_MANGLIK', 'ANSHIK_MANGLIK', 'DONT_KNOW');

-- CreateEnum
CREATE TYPE "ProfessionType" AS ENUM ('GOVERNMENT', 'BUSINESS', 'PRIVATE', 'NOT_WORKING');

-- CreateEnum
CREATE TYPE "Diet" AS ENUM ('VEG', 'NON_VEG', 'EGGETARIAN');

-- CreateEnum
CREATE TYPE "PhotoPrivacy" AS ENUM ('PUBLIC', 'PREMIUM_ONLY', 'ON_REQUEST');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'NEVER_MARRIED',
    "motherTongue" TEXT NOT NULL,
    "religion" TEXT NOT NULL DEFAULT 'Hindu',
    "caste" TEXT NOT NULL,
    "gotra" TEXT,
    "manglikStatus" "ManglikStatus" NOT NULL DEFAULT 'DONT_KNOW',
    "diet" "Diet" NOT NULL DEFAULT 'VEG',
    "height" DOUBLE PRECISION NOT NULL,
    "weight" INTEGER NOT NULL,
    "education" TEXT NOT NULL,
    "professionType" "ProfessionType" NOT NULL DEFAULT 'PRIVATE',
    "jobTitle" TEXT,
    "companyName" TEXT,
    "annualIncome" DOUBLE PRECISION,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "photos" TEXT[],
    "photoPrivacy" "PhotoPrivacy" NOT NULL DEFAULT 'PREMIUM_ONLY',
    "aboutMe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreference" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "minHeight" DOUBLE PRECISION,
    "maxHeight" DOUBLE PRECISION,
    "preferredCaste" TEXT,
    "preferredCity" TEXT,
    "notes" TEXT,

    CONSTRAINT "PartnerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyDetails" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "fatherName" TEXT,
    "fatherStatus" TEXT,
    "motherName" TEXT,
    "motherStatus" TEXT,
    "totalBrothers" INTEGER NOT NULL DEFAULT 0,
    "marriedBrothers" INTEGER NOT NULL DEFAULT 0,
    "totalSisters" INTEGER NOT NULL DEFAULT 0,
    "marriedSisters" INTEGER NOT NULL DEFAULT 0,
    "familyValues" TEXT,
    "familyIncome" DOUBLE PRECISION,
    "nativePlace" TEXT,

    CONSTRAINT "FamilyDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "amount" INTEGER NOT NULL,
    "planName" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "durationDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isApproved_isBlocked_isDeleted_idx" ON "User"("isApproved", "isBlocked", "isDeleted");

-- CreateIndex
CREATE INDEX "User_isPremium_subscriptionExpiresAt_idx" ON "User"("isPremium", "subscriptionExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_gender_religion_caste_idx" ON "Profile"("gender", "religion", "caste");

-- CreateIndex
CREATE INDEX "Profile_gender_dob_idx" ON "Profile"("gender", "dob");

-- CreateIndex
CREATE INDEX "Profile_gender_maritalStatus_idx" ON "Profile"("gender", "maritalStatus");

-- CreateIndex
CREATE INDEX "Profile_gender_professionType_idx" ON "Profile"("gender", "professionType");

-- CreateIndex
CREATE INDEX "Profile_gender_annualIncome_idx" ON "Profile"("gender", "annualIncome");

-- CreateIndex
CREATE INDEX "Profile_gender_motherTongue_idx" ON "Profile"("gender", "motherTongue");

-- CreateIndex
CREATE INDEX "Profile_gender_state_city_idx" ON "Profile"("gender", "state", "city");

-- CreateIndex
CREATE INDEX "Profile_createdAt_idx" ON "Profile"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreference_profileId_key" ON "PartnerPreference"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyDetails_profileId_key" ON "FamilyDetails"("profileId");

-- CreateIndex
CREATE INDEX "Interest_toUserId_status_idx" ON "Interest"("toUserId", "status");

-- CreateIndex
CREATE INDEX "Interest_fromUserId_status_idx" ON "Interest"("fromUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_fromUserId_toUserId_key" ON "Interest"("fromUserId", "toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpayOrderId_key" ON "Subscription"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreference" ADD CONSTRAINT "PartnerPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyDetails" ADD CONSTRAINT "FamilyDetails_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
