import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  wellnessGoal: string;
  age: number;
  gender?: string;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: string;
  dietaryPreferences: string[];
  allergens: string[];
  favoriteFoods: string[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  toSafeObject(): any;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    wellnessGoal: { type: String, default: "Lose Weight", enum: ["Lose Weight", "Build Muscle", "Maintain Weight", "Improve Fitness"] },
    age: { type: Number, default: 28, min: 13, max: 120 },
    gender: { type: String, enum: ["male", "female", "other", null], default: null },
    height: { type: Number, default: 178, min: 50, max: 300 },
    weight: { type: Number, default: 80, min: 20, max: 500 },
    targetWeight: { type: Number, default: 75, min: 20, max: 500 },
    activityLevel: { type: String, default: "moderate", enum: ["sedentary", "light", "moderate", "active", "very"] },
    dietaryPreferences: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    favoriteFoods: { type: [String], default: [] },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  // Map to frontend expected shape + keep raw
  return {
    id: obj._id.toString(),
    _id: obj._id.toString(),
    firstName: obj.firstName,
    lastName: obj.lastName,
    name: `${obj.firstName} ${obj.lastName}`.trim(),
    email: obj.email,
    wellnessGoal: obj.wellnessGoal,
    goal: obj.wellnessGoal,
    age: obj.age,
    gender: obj.gender,
    height: obj.height,
    weight: obj.weight,
    targetWeight: obj.targetWeight,
    activityLevel: obj.activityLevel,
    dietaryPreferences: obj.dietaryPreferences,
    allergens: obj.allergens,
    favoriteFoods: obj.favoriteFoods,
    avatar: obj.avatar,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

// Ensure email uniqueness index
UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
