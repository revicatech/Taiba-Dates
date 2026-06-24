import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProductSizeImage {
  url: string;
  publicId: string;
}

export interface IProductSize {
  subCategoryId?: string;
  label: string;
  images: IProductSizeImage[];
}

export interface IProduct extends Document {
  nameAR: string;
  nameEN?: string;
  description?: string;
  fullDescription?: string;
  category: Types.ObjectId;
  featured: boolean;
  features: string[];
  sizes: IProductSize[];
}

const productSizeImageSchema = new Schema<IProductSizeImage>(
  { url: { type: String, required: true }, publicId: { type: String, default: "" } },
  { _id: false }
);

const productSizeSchema = new Schema<IProductSize>(
  {
    subCategoryId: { type: String, default: "" },
    label: { type: String, required: true, trim: true },
    images: { type: [productSizeImageSchema], default: [] },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    nameAR: { type: String, required: true, trim: true },
    nameEN: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    fullDescription: { type: String, trim: true, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    featured: { type: Boolean, default: false },
    features: { type: [String], default: [] },
    sizes: { type: [productSizeSchema], default: [] },
  },
  { timestamps: true }
);

// Delete any cached model so schema changes take effect on hot-reload
if (mongoose.models.Product) delete mongoose.models.Product;
export const Product: Model<IProduct> = mongoose.model<IProduct>("Product", productSchema);
