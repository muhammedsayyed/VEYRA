import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkoutHistory extends Document {
  userId: mongoose.Types.ObjectId;
  workoutName: string;
  duration: number;
  caloriesBurned?: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutHistorySchema = new Schema<IWorkoutHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workoutName: { type: String, required: true },
    duration: { type: Number, required: true },
    caloriesBurned: { type: Number },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WorkoutHistory: Model<IWorkoutHistory> = mongoose.model<IWorkoutHistory>("WorkoutHistory", WorkoutHistorySchema);
