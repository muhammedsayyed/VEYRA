import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().max(50).trim().optional().default(""),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  goal: z.string().optional(),
  wellnessGoal: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
