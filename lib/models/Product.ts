import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProduct extends Document {
  nameAR: string;
  nameEN: string;
  slug: string;
  description: string;
  fullDescription: string;
  category: Types.ObjectId;
  featured: boolean;
  imageUrl: string;
  imagePublicId: string;
  weights: string[];
  features: string[];
}

const productSchema = new Schema<IProduct>(
  {
    nameAR: { type: String, required: true, trim: true },
    nameEN: { type: String, trim: true, default: "" },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: "" },
    fullDescription: { type: String, trim: true, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    featured: { type: Boolean, default: false },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    weights: { type: [String], default: [] },
    features: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", productSchema);
