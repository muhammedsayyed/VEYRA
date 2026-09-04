import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScanHistory extends Document {
  userId: mongoose.Types.ObjectId;
  barcode: string;
  productName: string;
  brand?: string;
  imageUrl?: string;
  productJson?: any;
  scannedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScanHistorySchema = new Schema<IScanHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    barcode: { type: String, required: true },
    productName: { type: String, required: true },
    brand: { type: String },
    imageUrl: { type: String },
    productJson: { type: Schema.Types.Mixed },
    scannedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ScanHistorySchema.index({ userId: 1, barcode: 1 });

export const ScanHistory: Model<IScanHistory> = mongoose.model<IScanHistory>("ScanHistory", ScanHistorySchema);
