import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecipeReview extends Document {
  userId: mongoose.Types.ObjectId;
  recipeId: string;
  rating: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeReviewSchema = new Schema<IRecipeReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipeId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

export const RecipeReview: Model<IRecipeReview> = mongoose.model<IRecipeReview>("RecipeReview", RecipeReviewSchema);
