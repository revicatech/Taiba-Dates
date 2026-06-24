import { connectDB } from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/Product";
import mongoose from "mongoose";

export type SubCategory = { _id: string; nameAR: string; nameEN: string };
export type Category = { _id: string; nameEN: string; nameAR: string; subCategories?: SubCategory[] };

export type ProductSizeImage = { url: string; publicId: string };
export type ProductSize = {
  subCategoryId: string;
  label: string;
  images: ProductSizeImage[];
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

function mapSize(s: Record<string, unknown>): ProductSize {
  // New format: images[]
  const newImages = s.images as { url: string; publicId: string }[] | undefined;
  if (newImages && newImages.length > 0) {
    return {
      subCategoryId: (s.subCategoryId as string) ?? "",
      label: (s.label as string) ?? "",
      images: newImages.map((img) => ({ url: img.url, publicId: img.publicId ?? "" })),
    };
  }
  // Legacy format: imageUrl / imagePublicId
  if (s.imageUrl) {
    return {
      subCategoryId: (s.subCategoryId as string) ?? "",
      label: (s.label as string) ?? "",
      images: [{ url: s.imageUrl as string, publicId: (s.imagePublicId as string) ?? "" }],
    };
  }
  return { subCategoryId: (s.subCategoryId as string) ?? "", label: (s.label as string) ?? "", images: [] };
}

function mapProduct(d: Record<string, unknown>): Product {
  const cat = d.category as Record<string, unknown> | null | undefined;
  const nameAR = (d.nameAR as string) || (d.name as string) || "";

  let sizes: ProductSize[];
  const rawSizes = d.sizes as Record<string, unknown>[] | undefined;
  if (rawSizes && rawSizes.length > 0) {
    sizes = rawSizes.map(mapSize);
  } else if (d.imageUrl) {
    // Legacy top-level imageUrl
    const weights = (d.weights as string[]) ?? [];
    const img = { url: d.imageUrl as string, publicId: (d.imagePublicId as string) ?? "" };
    if (weights.length > 0) {
      sizes = weights.map((w) => ({ subCategoryId: "", label: w, images: [img] }));
    } else {
      sizes = [{ subCategoryId: "", label: "—", images: [img] }];
    }
  } else {
    sizes = [];
  }

  return {
    _id: String(d._id),
    nameAR,
    nameEN: (d.nameEN as string) || "",
    description: (d.description as string) ?? "",
    fullDescription: (d.fullDescription as string) ?? "",
    category: cat ? {
      _id: String(cat._id),
      nameEN: (cat.nameEN as string) ?? "",
      nameAR: (cat.nameAR as string) ?? "",
      subCategories: ((cat.subCategories as SubCategory[]) ?? []).map((s) => ({
        _id: String(s._id),
        nameAR: s.nameAR,
        nameEN: s.nameEN ?? "",
      })),
    } : null,
    featured: Boolean(d.featured),
    features: (d.features as string[]) ?? [],
    sizes,
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
  } catch (err) {
    console.error("[fetchProducts] error:", err);
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
