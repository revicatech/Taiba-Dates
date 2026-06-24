import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubCategory {
  _id: mongoose.Types.ObjectId;
  nameAR: string;
  nameEN?: string;
}

export interface ICategory extends Document {
  nameEN?: string;
  nameAR: string;
  subCategories: ISubCategory[];
}

const subCategorySchema = new Schema<ISubCategory>({
  nameAR: { type: String, required: true, trim: true },
  nameEN: { type: String, trim: true, default: "" },
});

const categorySchema = new Schema<ICategory>(
  {
    nameAR: { type: String, required: true, unique: true, trim: true },
    nameEN: { type: String, trim: true },
    subCategories: { type: [subCategorySchema], default: [] },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>("Category", categorySchema);
