import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: string;
  mealsJson: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekStartDate: { type: String, required: true },
    mealsJson: { type: String, required: true },
  },
  { timestamps: true }
);

MealPlanSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

export const MealPlan: Model<IMealPlan> = mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);
