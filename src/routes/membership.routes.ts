import { Router } from "express";
import {
  createOrder,
  myMembership,
  getPlans,
  verifyPayment,
} from "../controller/membership.controller";
import { authCheck } from "../middleware/authCheck";
import { validate } from "../middleware/validate";
import { createOrderSchema, verifyPaymentSchema } from "../validation/membership.validation";

// NOTE: webhook route yahan NAHI hai — wo app.ts me alag se mount hoga
// kyunki usko raw body parser chahiye (signature verify ke liye) aur koi authCheck nahi.
const router = Router();

router.use(authCheck);

router.get("/plans", getPlans);
router.post("/order", validate(createOrderSchema), createOrder);
router.post("/verify", validate(verifyPaymentSchema), verifyPayment);
router.get("/me", myMembership);

export const membershipRoutes = router;
