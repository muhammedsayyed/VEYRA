import { Router } from "express";
import { chat } from "../controllers/ai.controller.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = Router();
router.post("/chat", aiLimiter, chat);
router.post("/", aiLimiter, chat);

export default router;
