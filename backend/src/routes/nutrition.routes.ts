import { Router } from "express";
import { getFoodLogs, addFoodLog, deleteFoodLog, getDailyNutrition, updateWater } from "../controllers/nutrition.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

// Food log sub-routes (for /api/nutrition mount)
router.get("/food-log", getFoodLogs);
router.post("/food-log", addFoodLog);
router.delete("/food-log/:id", deleteFoodLog);
router.delete("/food-log", deleteFoodLog);

// Water sub-routes (for /api/nutrition mount)
router.get("/daily", getDailyNutrition);
router.post("/water", updateWater);
router.put("/water", updateWater);

// Direct mounts: /api/food-log, /api/water, /api/daily-nutrition
// These are mounted at different base paths but share this router.
// We disambiguate GET "/" based on baseUrl.
router.get("/", (req, res, next) => {
  const base = (req as any).baseUrl || "";
  if (base.includes("food-log")) return getFoodLogs(req as any, res, next);
  if (base.includes("water")) return getDailyNutrition(req as any, res, next);
  return getDailyNutrition(req as any, res, next);
});
router.post("/", (req, res, next) => {
  const base = (req as any).baseUrl || "";
  if (base.includes("food-log")) return addFoodLog(req as any, res, next);
  if (base.includes("water")) return updateWater(req as any, res, next);
  return getDailyNutrition(req as any, res, next);
});
router.put("/", (req, res, next) => {
  const base = (req as any).baseUrl || "";
  if (base.includes("water")) return updateWater(req as any, res, next);
  return getDailyNutrition(req as any, res, next);
});
router.delete("/", (req, res, next) => {
  const base = (req as any).baseUrl || "";
  if (base.includes("food-log")) return deleteFoodLog(req as any, res, next);
  return (res as any).status(404).json({ success: false, message: "Not found" });
});
router.delete("/:id", (req, res, next) => {
  const base = (req as any).baseUrl || "";
  if (base.includes("food-log")) return deleteFoodLog(req as any, res, next);
  return (res as any).status(404).json({ success: false, message: "Not found" });
});

export default router;
