import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyNutrition extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  calorieTarget: number;
  caloriesConsumed: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsTarget: number;
  carbsConsumed: number;
  fatTarget: number;
  fatConsumed: number;
  waterTarget: number;
  waterConsumed: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyNutritionSchema = new Schema<IDailyNutrition>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    calorieTarget: { type: Number, default: 2100 },
    caloriesConsumed: { type: Number, default: 0 },
    proteinTarget: { type: Number, default: 130 },
    proteinConsumed: { type: Number, default: 0 },
    carbsTarget: { type: Number, default: 240 },
    carbsConsumed: { type: Number, default: 0 },
    fatTarget: { type: Number, default: 70 },
    fatConsumed: { type: Number, default: 0 },
    waterTarget: { type: Number, default: 2.5 },
    waterConsumed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DailyNutritionSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyNutrition: Model<IDailyNutrition> = mongoose.model<IDailyNutrition>("DailyNutrition", DailyNutritionSchema);
