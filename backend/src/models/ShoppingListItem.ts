import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShoppingListItem extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  recipeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingListItemSchema = new Schema<IShoppingListItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "pcs" },
    isPurchased: { type: Boolean, default: false },
    recipeId: { type: String },
  },
  { timestamps: true }
);

export const ShoppingListItem: Model<IShoppingListItem> = mongoose.model<IShoppingListItem>("ShoppingListItem", ShoppingListItemSchema);
