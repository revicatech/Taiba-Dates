import { connectDB } from "@/lib/db";
import { Category as CategoryModel } from "@/lib/models/Category";
import type { Category } from "./products";

export type { Category };

export async function fetchCategories(): Promise<Category[]> {
  try {
    await connectDB();
    const docs = await CategoryModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => ({
      _id: String(d._id),
      nameEN: d.nameEN ?? "",
      nameAR: d.nameAR,
      isDates: d.isDates !== false,
      subCategories: (d.subCategories ?? []).map((s) => ({
        _id: String(s._id),
        nameAR: s.nameAR,
        nameEN: s.nameEN ?? "",
      })),
    }));
  } catch {
    return [];
  }
}
