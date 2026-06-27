import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Category } from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth-middleware";
import { uploadToCloudinary } from "@/lib/upload-to-cloudinary";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "20", 10), 1), 100);
    const filter: Record<string, unknown> = {};
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      if (!mongoose.Types.ObjectId.isValid(categoryParam)) {
        return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
      }
      filter.category = categoryParam;
    }
    const [items, total] = await Promise.all([
      Product.find(filter).populate("category").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);
    return NextResponse.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();
    const formData = await req.formData();

    const nameAR = formData.get("nameAR") as string | null;
    const nameEN = (formData.get("nameEN") as string | null) ?? "";
    const category = formData.get("category") as string | null;
    const description = (formData.get("description") as string | null) ?? "";
    const fullDescription = (formData.get("fullDescription") as string | null) ?? "";
    const featured = formData.get("featured") === "true";
    const soldOut = formData.get("soldOut") === "true";
    const featuresRaw = (formData.get("features") as string | null) ?? "[]";
    const sizesRaw = (formData.get("sizes") as string | null) ?? "[]";

    if (!nameAR || !category) {
      return NextResponse.json({ message: "nameAR and category are required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
    }

    await connectDB();
    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) {
      return NextResponse.json({ message: "Referenced category does not exist" }, { status: 400 });
    }
    if (featured) {
      const featuredCount = await Product.countDocuments({ featured: true });
      if (featuredCount >= 3) {
        return NextResponse.json({ message: "الحد الأقصى 3 منتجات مميزة على الصفحة الرئيسية" }, { status: 400 });
      }
    }

    const sizesData: { label: string }[] = JSON.parse(sizesRaw);
    const features: string[] = JSON.parse(featuresRaw);
    const subCategoryIds: string[] = JSON.parse((formData.get("subCategoryIds") as string | null) ?? "[]");
    const sellByPiece = formData.get("sellByPiece") !== "false";
    const boxQuantities: number[] = JSON.parse((formData.get("boxQuantities") as string | null) ?? "[]")
      .map((n: unknown) => Number(n))
      .filter((n: number) => Number.isFinite(n) && n > 0);

    // Upload global product images: image_0, image_1, ...
    const images: { url: string; publicId: string }[] = [];
    let imgIdx = 0;
    while (true) {
      const file = formData.get(`image_${imgIdx}`) as File | null;
      if (!file || file.size === 0) break;
      const { url, publicId } = await uploadToCloudinary(file);
      images.push({ url, publicId });
      imgIdx++;
    }
    const sizes = sizesData.filter((s) => s.label).map((s) => ({ label: s.label }));
    const product = await Product.create({ nameAR, nameEN, category, description, fullDescription, featured, soldOut, features, sizes, subCategoryIds, images, sellByPiece, boxQuantities });
    await product.populate("category");
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
