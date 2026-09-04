import { Request, Response, NextFunction } from "express";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import * as authService from "../services/auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, email, password, goal, wellnessGoal } = req.body;
    const { user, token } = await authService.registerUser({
      firstName,
      lastName,
      email,
      password,
      wellnessGoal: goal || wellnessGoal,
    });
    res.cookie("veyra_session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });
    return successResponse(res, { token, user }, 201);
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    res.cookie("veyra_session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });
    return successResponse(res, { token, user }, 200);
  } catch (err) { next(err); }
}

export async function getMe(req: any, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) return errorResponse(res, "Unauthorized", 401);
    return successResponse(res, user.toSafeObject());
  } catch (err) { next(err); }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("veyra_session", { httpOnly: true, sameSite: "lax" });
  return successResponse(res, { message: "Logged out successfully" });
}
