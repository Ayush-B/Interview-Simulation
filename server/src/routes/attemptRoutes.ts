import { Router } from "express";
import { requireAuth } from "../middleware/auth";

import {
  submitAttempt,
  getAttempts
} from "../controllers/attemptController";

const router = Router();

router.post("/", requireAuth, submitAttempt);
router.get("/", requireAuth, getAttempts);

export default router;