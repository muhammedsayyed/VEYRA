import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { WorkoutHistory } from "../models/WorkoutHistory.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getWorkouts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const workouts = await WorkoutHistory.find({ userId: req.userId }).sort({ completedAt: -1 }).limit(50);
    return successResponse(res, workouts);
  } catch (err) { next(err); }
}

export async function addWorkout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { workoutName, routineName, name, duration, durationMinutes, caloriesBurned } = req.body;
    const title = String(workoutName || routineName || name || "Workout").trim();
    const dur = Number(duration || durationMinutes || 30);
    if (!title) return errorResponse(res, "Workout name is required", 400);
    const workout = await WorkoutHistory.create({
      userId: req.userId,
      workoutName: title,
      duration: dur,
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : undefined,
    });
    return successResponse(res, workout, 201);
  } catch (err) { next(err); }
}
