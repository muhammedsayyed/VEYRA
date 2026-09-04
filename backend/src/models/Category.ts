import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> = mongoose.model<ICategory>("Category", CategorySchema);
