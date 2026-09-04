import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFavoriteRecipe extends Document {
  userId: mongoose.Types.ObjectId;
  recipeId: string;
  recipeTitle: string;
  recipeImage?: string;
  recipeCategory?: string;
  recipeCountry?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteRecipeSchema = new Schema<IFavoriteRecipe>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipeId: { type: String, required: true },
    recipeTitle: { type: String, required: true },
    recipeImage: { type: String },
    recipeCategory: { type: String },
    recipeCountry: { type: String },
  },
  { timestamps: true }
);

FavoriteRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const FavoriteRecipe: Model<IFavoriteRecipe> = mongoose.model<IFavoriteRecipe>("FavoriteRecipe", FavoriteRecipeSchema);
