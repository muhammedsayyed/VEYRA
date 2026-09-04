import { User } from "../models/User.js";
import { AppError } from "../utils/apiResponse.js";

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user.toSafeObject();
}

export async function updateProfile(userId: string, updates: any) {
  // handle name -> first/last split already done in controller, but also handle wellnessGoal alias
  const allowed: Record<string, any> = {};
  if (updates.firstName !== undefined) allowed.firstName = String(updates.firstName).trim();
  if (updates.lastName !== undefined) allowed.lastName = String(updates.lastName).trim();
  if (updates.wellnessGoal !== undefined) allowed.wellnessGoal = updates.wellnessGoal;
  if (updates.goal !== undefined) allowed.wellnessGoal = updates.goal;
  if (updates.age !== undefined) allowed.age = updates.age;
  if (updates.height !== undefined) allowed.height = updates.height;
  if (updates.weight !== undefined) allowed.weight = updates.weight;
  if (updates.targetWeight !== undefined) allowed.targetWeight = updates.targetWeight;
  if (updates.activityLevel !== undefined) allowed.activityLevel = updates.activityLevel;
  if (updates.dietaryPreferences !== undefined) allowed.dietaryPreferences = updates.dietaryPreferences;
  if (updates.allergens !== undefined) allowed.allergens = updates.allergens;
  if (updates.favoriteFoods !== undefined) allowed.favoriteFoods = updates.favoriteFoods;
  if (updates.gender !== undefined) allowed.gender = updates.gender;
  if (updates.name && !updates.firstName) {
    const parts = String(updates.name).trim().split(" ");
    allowed.firstName = parts[0];
    allowed.lastName = parts.slice(1).join(" ");
  }
  const user = await User.findByIdAndUpdate(userId, allowed, { new: true, runValidators: true });
  if (!user) throw new AppError("User not found", 404);
  return user.toSafeObject();
}
