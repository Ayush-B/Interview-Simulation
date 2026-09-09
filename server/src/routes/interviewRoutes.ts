import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createInterview,
  getInterview,
  getNextQuestion,
  submitInterviewAnswer
} from "../controllers/interviewController";

const router = Router();

router.post("/", requireAuth, createInterview);
router.get("/:id/next", requireAuth, getNextQuestion);
router.get("/:id", requireAuth, getInterview);
router.post(
  "/:id/answers",
  requireAuth,
  submitInterviewAnswer
);

export default router;