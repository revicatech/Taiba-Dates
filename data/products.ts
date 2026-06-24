import { connectDB } from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/Product";
import mongoose from "mongoose";

export type SubCategory = { _id: string; nameAR: string; nameEN: string };
export type Category = { _id: string; nameEN: string; nameAR: string; subCategories?: SubCategory[] };

export type ProductSize = {
  subCategoryId: string;
  label: string;
  imageUrl: string;
  imagePublicId: string;
};

export type Product = {
  _id: string;
  nameAR: string;
  nameEN: string;
  description: string;
  fullDescription: string;
  category: Category | null;
  featured: boolean;
  features: string[];
  sizes: ProductSize[];
};

function mapProduct(d: Record<string, unknown>): Product {
  const cat = d.category as Record<string, unknown> | null | undefined;
  return {
    _id: String(d._id),
    nameAR: (d.nameAR as string) || "",
    nameEN: (d.nameEN as string) || "",
    description: (d.description as string) ?? "",
    fullDescription: (d.fullDescription as string) ?? "",
    category: cat ? {
      _id: String(cat._id),
      nameEN: cat.nameEN as string,
      nameAR: cat.nameAR as string,
      subCategories: ((cat.subCategories as SubCategory[]) ?? []).map((s) => ({
        _id: String(s._id),
        nameAR: s.nameAR,
        nameEN: s.nameEN ?? "",
      })),
    } : null,
    featured: Boolean(d.featured),
    features: (d.features as string[]) ?? [],
    sizes: ((d.sizes as ProductSize[]) ?? []).map((s) => ({
      subCategoryId: s.subCategoryId ?? "",
      label: s.label,
      imageUrl: s.imageUrl,
      imagePublicId: s.imagePublicId,
    })),
  };
}

type FetchProductsOptions = { limit?: number; category?: string; featuredOnly?: boolean };

export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const { limit = 20, category, featuredOnly = false } = options;
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (featuredOnly) filter.featured = true;
    const docs = await ProductModel.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d) => mapProduct(d as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  try {
    await connectDB();
    const doc = await ProductModel.findById(id).populate("category").lean();
    if (!doc) return null;
    return mapProduct(doc as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}
