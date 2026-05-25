import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  nameEN: string;
  nameAR: string;
}

const categorySchema = new Schema<ICategory>(
  {
    nameEN: { type: String, required: true, unique: true, trim: true },
    nameAR: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>("Category", categorySchema);
