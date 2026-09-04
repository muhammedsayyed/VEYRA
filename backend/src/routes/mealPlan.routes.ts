import { Router } from "express";
import { getMealPlan, saveMealPlan, generateMealPlan } from "../controllers/mealPlan.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getMealPlan);
router.post("/", saveMealPlan);
router.post("/generate", generateMealPlan);
// Also support query ?action=generate
router.post("/generate-week", generateMealPlan);

export default router;
