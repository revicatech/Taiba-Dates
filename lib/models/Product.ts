import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  category: Types.ObjectId;
  imageUrl: string;
  imagePublicId: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", productSchema);
