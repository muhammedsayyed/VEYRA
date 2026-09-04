import { Router } from "express";
import { register, login, getMe, logout } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { zodValidate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authLimiter, loginLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, zodValidate(registerSchema), register);
router.post("/signup", authLimiter, zodValidate(registerSchema), register);
router.post("/login", loginLimiter, zodValidate(loginSchema), login);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.get("/logout", logout);

export default router;
