import { Router } from "express";
import {
  getStats, listUsers, approveUser, toggleBlock, deleteUser,
  makeAdmin, removeAdmin, addProfile, bulkAddProfiles, addProfilePhoto, listPlans, createPlan, updatePlan, deletePlan,
} from "../controller/admin.controller";
import { authCheck } from "../middleware/authCheck";
import { roleCheck } from "../middleware/roleCheck";
import { validate } from "../middleware/validate";
import { upload } from "../integration/storage";
import { addProfileSchema, bulkProfileSchema, createPlanSchema, updatePlanSchema, listUsersSchema } from "../validation/admin.validation";

// Admin routes — login zaroori + role check.
// ADMIN aur SUPER_ADMIN dono manage kar sakte hain.
// make-admin / remove-admin / plan changes sirf SUPER_ADMIN.
const router = Router();

router.use(authCheck, roleCheck("ADMIN", "SUPER_ADMIN"));

router.get("/stats", getStats);
router.get("/users", validate(listUsersSchema), listUsers);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/block", toggleBlock);
router.delete("/users/:id", deleteUser);
router.post("/profile", validate(addProfileSchema), addProfile);
router.post("/profile/:userId/photo", upload.single("photo"), addProfilePhoto);
router.post("/profiles/bulk", validate(bulkProfileSchema), bulkAddProfiles);
router.get("/plans", listPlans);

// Sirf super admin
router.patch("/users/:id/make-admin", roleCheck("SUPER_ADMIN"), makeAdmin);
router.patch("/users/:id/remove-admin", roleCheck("SUPER_ADMIN"), removeAdmin);
router.post("/plans", roleCheck("SUPER_ADMIN"), validate(createPlanSchema), createPlan);
router.patch("/plans/:id", roleCheck("SUPER_ADMIN"), validate(updatePlanSchema), updatePlan);
router.delete("/plans/:id", roleCheck("SUPER_ADMIN"), deletePlan);

export const adminRoutes = router;
