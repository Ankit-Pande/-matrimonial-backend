import "dotenv/config";
import { z } from "zod";

// Saari env ek jagah validate. Galat/missing pe app start hi nahi hoga (fail-fast).
// Third-party keys (MSG91/Razorpay/Cloudinary) dev me optional, prod me must.
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  DATABASE_URL: z.string().url("Invalid Database URL format"),
  DIRECT_URL: z.string().url("Invalid Direct Database URL format").optional(),
  REDIS_URL: z.string().url("Invalid Redis URL format"),

  FRONTEND_ORIGINS: z.string().min(1, "Frontend origin is required"),

  // Pehla super admin (seed script isi number ko SUPER_ADMIN banata hai).
  SUPER_ADMIN_PHONE: z.string().optional(),

  // JWT — header-based auth (web + Android same). Koi cookie/CSRF nahi.
  JWT_ACCESS_SECRET: z.string().min(32, "Access secret must be at least 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "Refresh secret must be at least 32 chars"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),

  // MSG91 — OTP SMS. Khaali ho to demo mode (OTP response me aata hai).
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().optional(),
  MSG91_OTP_TEMPLATE_ID: z.string().optional(),

  // Cloudinary — profile photos. Required for uploads.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Razorpay — membership payment.
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
