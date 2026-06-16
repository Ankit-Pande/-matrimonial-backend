import { Router } from "express";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  updatePrivacy,
  uploadPhoto,
  deletePhoto,
} from "../controller/user.controller";
import { authCheck } from "../middleware/authCheck";
import { validate } from "../middleware/validate";
import { upload } from "../integration/storage";
import {
  createProfileSchema,
  updateProfileSchema,
  updatePrivacySchema,
  deletePhotoSchema,
} from "../validation/user.validation";

const router = Router();

// Sab routes login-protected.
router.use(authCheck);

router.get("/me", getMyProfile);
router.post("/profile", validate(createProfileSchema), createProfile);
router.patch("/profile", validate(updateProfileSchema), updateProfile);
router.patch("/privacy", validate(updatePrivacySchema), updatePrivacy);

// Photo: multer single file "photo". Cloudinary upload storage.ts me.
router.post("/photo", upload.single("photo"), uploadPhoto);
router.delete("/photo", validate(deletePhotoSchema), deletePhoto);

export const userRoutes = router;
