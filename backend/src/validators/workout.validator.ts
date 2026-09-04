import { z } from "zod";

export const createWorkoutSchema = z.object({
  workoutName: z.string().min(1).max(100).optional(),
  routineName: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100).optional(),
  duration: z.number().min(1).max(600).optional(),
  durationMinutes: z.number().min(1).max(600).optional(),
  caloriesBurned: z.number().min(0).max(5000).optional(),
});

export const createWeightSchema = z.object({
  weight: z.number().min(20).max(500).or(z.string().transform(Number)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
