import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecipe extends Document {
  slug: string;
  name: string;
  description?: string;
  countryId?: mongoose.Types.ObjectId;
  countryCode?: string;
  countryName?: string;
  difficulty: string;
  proteinType?: string;
  dietType?: string;
  prepTimeMin?: number;
  cookTimeMin?: number;
  servings: number;
  servingSize?: string;
  homePrepCost?: number;
  restaurantPrice?: number;
  currency?: string;
  imageUrl?: string;
  isPopular: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  popularityScore: number;
  published: boolean;
  tags: string[];
  categories: string[];
  ingredients: Array<{ name: string; quantity?: number; unit?: string; note?: string }>;
  steps: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    saturatedFat?: number;
  };
  videos: Array<{ youtubeVideoId: string; youtubeUrl: string; videoTitle?: string; channelName?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    countryCode: { type: String },
    countryName: { type: String },
    countryId: { type: Schema.Types.ObjectId, ref: "Country" },
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
    proteinType: { type: String, enum: ["BEEF","CHICKEN","SEAFOOD","PORK","LAMB","MIXED","VEGETARIAN","NONE", null], default: null },
    dietType: { type: String, enum: ["BALANCED","HIGH_PROTEIN","LOW_CARB","KETO","VEGETARIAN","VEGAN","GLUTEN_FREE","HALAL", null], default: null },
    prepTimeMin: { type: Number },
    cookTimeMin: { type: Number },
    servings: { type: Number, default: 1 },
    servingSize: { type: String },
    homePrepCost: { type: Number },
    restaurantPrice: { type: Number },
    currency: { type: String },
    imageUrl: { type: String },
    isPopular: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    popularityScore: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    ingredients: { type: [{ name: String, quantity: Number, unit: String, note: String }], default: [] },
    steps: { type: [String], default: [] },
    nutrition: {
      calories: Number,
      protein: Number,
      carbohydrates: Number,
      fat: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number,
      saturatedFat: Number,
    },
    videos: { type: [{ youtubeVideoId: String, youtubeUrl: String, videoTitle: String, channelName: String }], default: [] },
  },
  { timestamps: true }
);

RecipeSchema.index({ countryCode: 1 });
RecipeSchema.index({ isPopular: 1 });
RecipeSchema.index({ proteinType: 1 });
RecipeSchema.index({ name: "text", description: "text" });

export const Recipe: Model<IRecipe> = mongoose.model<IRecipe>("Recipe", RecipeSchema);
