import { Router } from "express";
import { searchProfiles, getProfile } from "../controller/search.controller";
import { authCheck } from "../middleware/authCheck";
import { validate } from "../middleware/validate";
import { searchSchema } from "../validation/search.validation";

const router = Router();

router.use(authCheck);

router.get("/", validate(searchSchema), searchProfiles);
router.get("/:id", getProfile);

export const searchRoutes = router;
