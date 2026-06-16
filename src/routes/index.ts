import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";
import { searchRoutes } from "./search.routes";
import { interestRoutes } from "./interest.routes";
import { membershipRoutes } from "./membership.routes";
import { adminRoutes } from "./admin.routes";

// Saare module routes ek jagah. /health aur /membership/webhook app.ts me alag mount hote hain.
const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/search", searchRoutes);
router.use("/interest", interestRoutes);
router.use("/membership", membershipRoutes);
router.use("/admin", adminRoutes);

export const apiRoutes = router;
