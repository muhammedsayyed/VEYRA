import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICountry extends Document {
  code: string;
  slug: string;
  name: string;
  region?: string;
  cuisineLabel: string;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>(
  {
    code: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, unique: true },
    region: { type: String },
    cuisineLabel: { type: String, required: true },
    currency: { type: String },
  },
  { timestamps: true }
);

export const Country: Model<ICountry> = mongoose.model<ICountry>("Country", CountrySchema);
