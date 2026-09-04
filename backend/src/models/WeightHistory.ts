import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWeightHistory extends Document {
  userId: mongoose.Types.ObjectId;
  weight: number;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeightHistorySchema = new Schema<IWeightHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weight: { type: Number, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

WeightHistorySchema.index({ userId: 1, date: 1 });

export const WeightHistory: Model<IWeightHistory> = mongoose.model<IWeightHistory>("WeightHistory", WeightHistorySchema);
