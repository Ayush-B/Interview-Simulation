import { Router } from "express";
import { getRandomQuestion } from "../controllers/questionController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/random", requireAuth, getRandomQuestion);

export default router;