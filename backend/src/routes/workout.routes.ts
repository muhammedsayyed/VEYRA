import { Router } from "express";
import { getWorkouts, addWorkout } from "../controllers/workout.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getWorkouts);
router.post("/", addWorkout);

export default router;
