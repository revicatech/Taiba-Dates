import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProductSize {
  label: string;
}

export interface IProduct extends Document {
  nameAR: string;
  nameEN?: string;
  description?: string;
  fullDescription?: string;
  category: Types.ObjectId;
  featured: boolean;
  soldOut: boolean;
  features: string[];
  /** @deprecated legacy weight labels — kept only so old docs migrate into `weights`. */
  sizes: IProductSize[];
  grades: string[];   // الأحجام / الأصناف, e.g. جامبو (optional)
  weights: string[];  // الأوزان, e.g. 500g, 800g (optional)
  subCategoryIds: string[];
  images: IProductImage[];
  sellByPiece: boolean;
  boxQuantities: number[];
}

const productImageSchema = new Schema<IProductImage>(
  { url: { type: String, required: true }, publicId: { type: String, default: "" } },
  { _id: false }
);

const productSizeSchema = new Schema<IProductSize>(
  { label: { type: String, required: true, trim: true } },
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
    soldOut: { type: Boolean, default: false, index: true },
    features: { type: [String], default: [] },
    // `sizes` is the legacy weight field; kept so existing docs still migrate into `weights`.
    sizes: { type: [productSizeSchema], default: [] },
    grades: { type: [String], default: [] },
    weights: { type: [String], default: [] },
    subCategoryIds: { type: [String], default: [] },
    images: { type: [productImageSchema], default: [] },
    sellByPiece: { type: Boolean, default: true },
    boxQuantities: { type: [Number], default: [] },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", productSchema);
