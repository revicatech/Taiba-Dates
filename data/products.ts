import { connectDB } from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/Product";
import { Category as CategoryModel } from "@/lib/models/Category";
import mongoose from "mongoose";

// Category ids split by whether they are "dates" categories or "other products".
async function getCategoryIdsByType(): Promise<{ datesIds: mongoose.Types.ObjectId[]; otherIds: mongoose.Types.ObjectId[] }> {
  const cats = await CategoryModel.find().select("_id isDates").lean();
  const datesIds: mongoose.Types.ObjectId[] = [];
  const otherIds: mongoose.Types.ObjectId[] = [];
  for (const c of cats) {
    // Legacy categories without the flag are treated as dates.
    if (c.isDates === false) otherIds.push(c._id as mongoose.Types.ObjectId);
    else datesIds.push(c._id as mongoose.Types.ObjectId);
  }
  return { datesIds, otherIds };
}

export type SubCategory = { _id: string; nameAR: string; nameEN: string };
export type Category = { _id: string; nameEN: string; nameAR: string; isDates?: boolean; subCategories?: SubCategory[] };

export type ProductSizeImage = { url: string; publicId: string };

/** Grade×weight combo stored on a product. Empty array = all cross-product combos are valid. */
export type StoredVariant = { grade?: string; weight?: string };

/** Resolved variant with packaging included — passed to the public product detail page. */
export type EffectiveVariant = {
  grade?: string;
  weight?: string;
  sellByPiece: boolean;
  boxQuantities: number[];
};

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
  grades: string[];
  weights: string[];
  subCategoryIds: string[];
  images: ProductSizeImage[];
  sellByPiece: boolean;
  boxQuantities: number[];
  variants: StoredVariant[];
};

function mapProduct(d: Record<string, unknown>): Product {
  const cat = d.category as Record<string, unknown> | null | undefined;
  const nameAR = (d.nameAR as string) || (d.name as string) || "";

  // Legacy `sizes` ([{ label }]) held weight labels — migrate into `weights`.
  const rawSizes = d.sizes as Record<string, unknown>[] | undefined;
  const legacyWeights = (rawSizes ?? [])
    .filter((s) => s.label)
    .map((s) => s.label as string);
  const grades = ((d.grades as string[]) ?? []).filter(Boolean);
  const rawWeights = ((d.weights as string[]) ?? []).filter(Boolean);
  const weights = rawWeights.length > 0 ? rawWeights : legacyWeights;

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

  const rawVariants = ((d.variants as { grade?: string; weight?: string }[]) ?? []);
  const variants: StoredVariant[] = rawVariants.map((v) => ({
    grade: v.grade || undefined,
    weight: v.weight || undefined,
  }));

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
      isDates: cat.isDates !== false,
      subCategories: ((cat.subCategories as SubCategory[]) ?? []).map((s) => ({
        _id: String(s._id),
        nameAR: s.nameAR,
        nameEN: s.nameEN ?? "",
      })),
    } : null,
    featured: Boolean(d.featured),
    soldOut: Boolean(d.soldOut),
    features: (d.features as string[]) ?? [],
    grades,
    weights,
    subCategoryIds,
    images,
    sellByPiece: d.sellByPiece !== false,
    boxQuantities: ((d.boxQuantities as number[]) ?? []).filter((n) => Number.isFinite(n) && n > 0),
    variants,
  };
}

/**
 * Derives the effective selectable variants for a product's detail page.
 * If the product has explicit `variants` (grade×weight combos), those are used with
 * the product's global packaging. Otherwise falls back to the cross-product of all
 * grades×weights (backward-compatible for products created before variants were added).
 */
export function deriveVariants(product: {
  variants: StoredVariant[];
  grades: string[];
  weights: string[];
  sellByPiece: boolean;
  boxQuantities: number[];
}): EffectiveVariant[] {
  const pkg = { sellByPiece: product.sellByPiece, boxQuantities: product.boxQuantities };

  if (product.variants.length > 0) {
    return product.variants.map((v) => ({
      grade: v.grade || undefined,
      weight: v.weight || undefined,
      ...pkg,
    }));
  }

  const { grades, weights } = product;
  if (!grades.length && !weights.length) return [{ ...pkg }];
  if (!grades.length) return weights.map((w) => ({ weight: w, ...pkg }));
  if (!weights.length) return grades.map((g) => ({ grade: g, ...pkg }));

  const result: EffectiveVariant[] = [];
  for (const g of grades) {
    for (const w of weights) result.push({ grade: g, weight: w, ...pkg });
  }
  return result;
}

type FetchProductsOptions = {
  limit?: number;
  category?: string;
  subCategory?: string;
  // "box" → only products offering a box; "piece" → only products sold by the piece.
  unit?: "box" | "piece";
  featuredOnly?: boolean;
  // Sold-out products are hidden from the public site by default.
  includeSoldOut?: boolean;
};

export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const { limit = 20, category, subCategory, unit, featuredOnly = false, includeSoldOut = false } = options;
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategoryIds = subCategory;
    if (unit === "box") filter["boxQuantities.0"] = { $exists: true };
    if (unit === "piece") filter.sellByPiece = { $ne: false };
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
 * then recent non-featured products to fill up to `limit`. Sold-out products and
 * non-dates ("other") products are always excluded — those live in their own
 * "Other Products" section. Guarantees the section shows products even if few/none
 * are featured.
 */
export async function fetchCollectionProducts(limit = 3): Promise<Product[]> {
  try {
    await connectDB();
    const { datesIds } = await getCategoryIdsByType();
    const base = { soldOut: { $ne: true }, category: { $in: datesIds } };

    const featured = await ProductModel.find({ ...base, featured: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    let docs = featured;
    if (featured.length < limit) {
      const featuredIds = featured.map((d) => d._id);
      const fillers = await ProductModel.find({
        ...base,
        featured: { $ne: true },
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

/**
 * Products belonging to non-dates ("other products") categories, for the public
 * "Other Products" section. Sold-out products are excluded. Returns [] when there
 * are no such categories/products, so the section can hide itself.
 */
export async function fetchOtherProducts(limit = 12): Promise<Product[]> {
  try {
    await connectDB();
    const { otherIds } = await getCategoryIdsByType();
    if (otherIds.length === 0) return [];
    const docs = await ProductModel.find({
      category: { $in: otherIds },
      soldOut: { $ne: true },
    })
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d) => mapProduct(d as unknown as Record<string, unknown>));
  } catch (err) {
    console.error("[fetchOtherProducts] error:", err);
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
