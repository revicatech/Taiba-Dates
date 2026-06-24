import { connectDB } from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/Product";

export type Category = {
  _id: string;
  nameEN: string;
  nameAR: string;
};

export type Product = {
  _id: string;
  nameAR: string;
  nameEN: string;
  slug: string;
  description: string;
  fullDescription: string;
  category: Category | null;
  featured: boolean;
  imageUrl: string;
  weights: string[];
  features: string[];
};

type FetchProductsOptions = {
  limit?: number;
  category?: string;
  featuredOnly?: boolean;
};

function mapProduct(d: Record<string, unknown>): Product {
  const cat = d.category as Record<string, unknown> | null | undefined;
  return {
    _id: String(d._id),
    nameAR: (d.nameAR as string) || "",
    nameEN: (d.nameEN as string) || "",
    slug: (d.slug as string) || "",
    description: (d.description as string) ?? "",
    fullDescription: (d.fullDescription as string) ?? "",
    category: cat
      ? {
          _id: String(cat._id),
          nameEN: cat.nameEN as string,
          nameAR: cat.nameAR as string,
        }
      : null,
    featured: Boolean(d.featured),
    imageUrl: d.imageUrl as string,
    weights: (d.weights as string[]) ?? [],
    features: (d.features as string[]) ?? [],
  };
}

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

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    await connectDB();
    const doc = await ProductModel.findOne({ slug }).populate("category").lean();
    if (!doc) return null;
    return mapProduct(doc as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}
