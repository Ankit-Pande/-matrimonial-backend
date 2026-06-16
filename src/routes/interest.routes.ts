import { Router } from "express";
import {
  sendInterest,
  respondInterest,
  sentInterests,
  receivedInterests,
} from "../controller/interest.controller";
import { authCheck } from "../middleware/authCheck";
import { validate } from "../middleware/validate";
import {
  sendInterestSchema,
  respondInterestSchema,
  listInterestSchema,
} from "../validation/interest.validation";

const router = Router();

router.use(authCheck);

router.post("/", validate(sendInterestSchema), sendInterest);
router.patch("/:id", validate(respondInterestSchema), respondInterest);
router.get("/sent", validate(listInterestSchema), sentInterests);
router.get("/received", validate(listInterestSchema), receivedInterests);

export const interestRoutes = router;
