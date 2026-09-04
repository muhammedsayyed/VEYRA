import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/profile", getProfile);
router.get("/", getProfile);
router.put("/profile", updateProfile);
router.put("/", updateProfile);
router.patch("/profile", updateProfile);

export default router;
