import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

// Profile photos -> Cloudinary (server disk pe nahi -> backup/space problem khatam).
// DB me sirf URL save hota hai.
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    let format: "jpg" | "png" | "webp" = "jpg";
    if (file.mimetype === "image/png") format = "png";
    else if (file.mimetype === "image/webp") format = "webp";

    return {
      folder: "matrimonial_profiles",
      format,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      // Bade photo auto chhote — width max 1200px, quality auto (space + speed).
      transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
    };
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError("Only jpg, jpeg, png and webp images are allowed", 400)
    );
  }
  return cb(null, true);
};

// max 5MB. MulterError (size/type) error.ts central handler pakadta hai.
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
