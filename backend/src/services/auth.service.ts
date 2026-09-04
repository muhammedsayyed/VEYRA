import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { AppError } from "../utils/apiResponse.js";

export async function registerUser(data: { firstName: string; lastName?: string; email: string; password: string; wellnessGoal?: string }) {
  const cleanEmail = data.email.toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) throw new AppError("An account with this email already exists.", 409);
  const user = await User.create({
    firstName: data.firstName.trim(),
    lastName: (data.lastName || "").trim(),
    email: cleanEmail,
    password: data.password,
    wellnessGoal: data.wellnessGoal || "Lose Weight",
  });
  const token = signToken({ userId: (user._id as any).toString(), email: user.email });
  return { user: user.toSafeObject(), token };
}

export async function loginUser(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail }).select("+password");
  if (!user) throw new AppError("Invalid email or password.", 401);
  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError("Invalid email or password.", 401);
  const token = signToken({ userId: (user._id as any).toString(), email: user.email });
  const safe = await User.findById(user._id);
  return { user: safe!.toSafeObject(), token };
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404);
  return user.toSafeObject();
}
