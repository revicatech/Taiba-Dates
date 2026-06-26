import { connectDB } from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/Product";
import mongoose from "mongoose";

export type SubCategory = { _id: string; nameAR: string; nameEN: string };
export type Category = { _id: string; nameEN: string; nameAR: string; subCategories?: SubCategory[] };

export type ProductSizeImage = { url: string; publicId: string };
export type ProductSize = { label: string };

export type Product = {
  _id: string;
  nameAR: string;
  nameEN: string;
  description: string;
  fullDescription: string;
  category: Category | null;
  featured: boolean;
  soldOut: boolean;
  features: string[];
  sizes: ProductSize[];
  subCategoryIds: string[];
  images: ProductSizeImage[];
};

function mapProduct(d: Record<string, unknown>): Product {
  const cat = d.category as Record<string, unknown> | null | undefined;
  const nameAR = (d.nameAR as string) || (d.name as string) || "";

  // Sizes: new format is [{ label }], old format is [{ subCategoryId, label, images[] }]
  const rawSizes = d.sizes as Record<string, unknown>[] | undefined;
  const sizes: ProductSize[] = (rawSizes ?? [])
    .filter((s) => s.label)
    .map((s) => ({ label: s.label as string }));

  // Images: new format is top-level images[], old format is per-size images
  let images: ProductSizeImage[] = [];
  const rawImages = d.images as { url: string; publicId: string }[] | undefined;
  if (rawImages && rawImages.length > 0) {
    images = rawImages.map((img) => ({ url: img.url, publicId: img.publicId ?? "" }));
  } else if (rawSizes && rawSizes.length > 0) {
    // Legacy: flatten per-size images
    for (const s of rawSizes) {
      const sImgs = s.images as { url: string; publicId: string }[] | undefined;
      if (sImgs && sImgs.length > 0) {
        for (const img of sImgs) {
          if (img.url && !images.find((i) => i.url === img.url)) {
            images.push({ url: img.url, publicId: img.publicId ?? "" });
          }
        }
      } else if (s.imageUrl) {
        const url = s.imageUrl as string;
        if (!images.find((i) => i.url === url)) {
          images.push({ url, publicId: (s.imagePublicId as string) ?? "" });
        }
      }
    }
    // Legacy top-level imageUrl
    if (images.length === 0 && d.imageUrl) {
      images = [{ url: d.imageUrl as string, publicId: (d.imagePublicId as string) ?? "" }];
    }
  }

  // subCategoryIds: new top-level field, or derive from old per-size subCategoryId
  let subCategoryIds: string[] = [];
  const rawSubIds = d.subCategoryIds as string[] | undefined;
  if (rawSubIds && rawSubIds.length > 0) {
    subCategoryIds = rawSubIds;
  } else if (rawSizes && rawSizes.length > 0) {
    const seen = new Set<string>();
    for (const s of rawSizes) {
      const sid = s.subCategoryId as string | undefined;
      if (sid && !seen.has(sid)) { seen.add(sid); subCategoryIds.push(sid); }
    }
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
    soldOut: Boolean(d.soldOut),
    features: (d.features as string[]) ?? [],
    sizes,
    subCategoryIds,
    images,
  };
}

type FetchProductsOptions = {
  limit?: number;
  category?: string;
  featuredOnly?: boolean;
  // Sold-out products are hidden from the public site by default.
  includeSoldOut?: boolean;
};

export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const { limit = 20, category, featuredOnly = false, includeSoldOut = false } = options;
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (featuredOnly) filter.featured = true;
    if (!includeSoldOut) filter.soldOut = { $ne: true };
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

/**
 * Products for the homepage "Our Collection" section: featured products first,
 * then recent non-featured products to fill up to `limit`. Sold-out products are
 * always excluded. Guarantees the section shows products even if few/none are featured.
 */
export async function fetchCollectionProducts(limit = 3): Promise<Product[]> {
  try {
    await connectDB();
    const featured = await ProductModel.find({ featured: true, soldOut: { $ne: true } })
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    let docs = featured;
    if (featured.length < limit) {
      const featuredIds = featured.map((d) => d._id);
      const fillers = await ProductModel.find({
        featured: { $ne: true },
        soldOut: { $ne: true },
        _id: { $nin: featuredIds },
      })
        .populate("category")
        .sort({ createdAt: -1 })
        .limit(limit - featured.length)
        .lean();
      docs = [...featured, ...fillers];
    }

    return docs.map((d) => mapProduct(d as unknown as Record<string, unknown>));
  } catch (err) {
    console.error("[fetchCollectionProducts] error:", err);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  try {
    await connectDB();
    const doc = await ProductModel.findById(id).populate("category").lean();
    if (!doc) return null;
    const product = mapProduct(doc as unknown as Record<string, unknown>);
    // Sold-out products are hidden from the public site.
    if (product.soldOut) return null;
    return product;
  } catch {
    return null;
  }
}
