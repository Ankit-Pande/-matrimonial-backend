import { PrismaClient } from "@prisma/client";

// Ye script do kaam karti hai:
// 1. .env me diye SUPER_ADMIN_PHONE number ko super admin banati hai.
// 2. Default plans (Monthly aur Annual) DB me daalti hai agar pehle se na hon.
// Chalane ke liye: npm run seed

const prisma = new PrismaClient();

// Number ko ek jaisa banata hai (10 digit ho to aage 91 lagata hai).
const normalizePhone = (phone: string): string => {
  const saafNumber = phone.trim().replace(/[\s\-+]/g, "");
  return saafNumber.length === 10 ? `91${saafNumber}` : saafNumber;
};

async function main() {
  // ----- Step 1: Super admin banao -----
  const numberFromEnv = process.env.SUPER_ADMIN_PHONE;
  if (!numberFromEnv) {
    console.error("SUPER_ADMIN_PHONE .env me set nahi hai");
    process.exit(1);
  }

  const phone = normalizePhone(numberFromEnv);

  // Number pehle se ho to super admin bana do, na ho to naya banao.
  const superAdmin = await prisma.user.upsert({
    where: { phone },
    update: { role: "SUPER_ADMIN", isApproved: true },
    create: { phone, role: "SUPER_ADMIN", isApproved: true },
  });
  console.log(`Super admin taiyaar: ${superAdmin.phone}`);

  // ----- Step 2: Default plans daalo (agar pehle se na hon) -----
  // Admin baad me apne plans bana/badal sakta hai. Ye sirf shuruaati hain.
  await prisma.plan.upsert({
    where: { name: "1 Month" },
    update: {},
    create: { name: "1 Month", pricePaise: 49900, durationDays: 30 },
  });
  await prisma.plan.upsert({
    where: { name: "1 Year" },
    update: {},
    create: { name: "1 Year", pricePaise: 299900, durationDays: 365 },
  });
  console.log("Default plans taiyaar (1 Month + 1 Year)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
