import { connectDB } from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/Product";

export type Category = {
  _id: string;
  nameEN: string;
  nameAR: string;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  category: Category | null;
  imageUrl: string;
};

type FetchProductsOptions = {
  limit?: number;
  category?: string;
};

export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const { limit = 20, category } = options;
  try {
    await connectDB();
    const filter = category ? { category } : {};
    const docs = await ProductModel.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return docs.map((d) => ({
      _id: String(d._id),
      name: d.name,
      description: d.description ?? "",
      category: d.category
        ? {
            _id: String((d.category as unknown as { _id: unknown })._id),
            nameEN: (d.category as unknown as { nameEN: string }).nameEN,
            nameAR: (d.category as unknown as { nameAR: string }).nameAR,
          }
        : null,
      imageUrl: d.imageUrl,
    }));
  } catch {
    return [];
  }
}
