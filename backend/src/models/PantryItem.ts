import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPantryItem extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  addedDate: Date;
  expirationDate?: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PantryItemSchema = new Schema<IPantryItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "pcs" },
    addedDate: { type: Date, default: Date.now },
    expirationDate: { type: Date },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PantryItem: Model<IPantryItem> = mongoose.model<IPantryItem>("PantryItem", PantryItemSchema);
