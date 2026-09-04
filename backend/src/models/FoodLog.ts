import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFoodLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  mealType: string;
  productBarcode?: string;
  productName: string;
  brand?: string;
  imageUrl?: string;
  servingSize?: string;
  grams: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  sugar?: number;
  fat: number;
  saturatedFat?: number;
  fiber?: number;
  sodium?: number;
  salt?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  potassium?: number;
  zinc?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminB1?: number;
  vitaminB2?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  folate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FoodLogSchema = new Schema<IFoodLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    mealType: { type: String, required: true, enum: ["breakfast", "lunch", "snack", "dinner", "drinks", "Breakfast", "Lunch", "Snack", "Dinner", "Drinks"] },
    productBarcode: { type: String },
    productName: { type: String, required: true },
    brand: { type: String },
    imageUrl: { type: String },
    servingSize: { type: String },
    grams: { type: Number, default: 100 },
    servings: { type: Number, default: 1 },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    sugar: { type: Number },
    fat: { type: Number, default: 0 },
    saturatedFat: { type: Number },
    fiber: { type: Number },
    sodium: { type: Number },
    salt: { type: Number },
    calcium: { type: Number },
    iron: { type: Number },
    magnesium: { type: Number },
    potassium: { type: Number },
    zinc: { type: Number },
    vitaminA: { type: Number },
    vitaminC: { type: Number },
    vitaminD: { type: Number },
    vitaminE: { type: Number },
    vitaminK: { type: Number },
    vitaminB1: { type: Number },
    vitaminB2: { type: Number },
    vitaminB6: { type: Number },
    vitaminB12: { type: Number },
    folate: { type: Number },
  },
  { timestamps: true }
);

FoodLogSchema.index({ userId: 1, date: 1 });
FoodLogSchema.index({ userId: 1, createdAt: -1 });

export const FoodLog: Model<IFoodLog> = mongoose.model<IFoodLog>("FoodLog", FoodLogSchema);
