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
      Product.find(filter)
        .populate("category")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
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
    const name = formData.get("name") as string | null;
    const category = formData.get("category") as string | null;
    const description = (formData.get("description") as string | null) ?? "";
    const imageFile = formData.get("image") as File | null;

    if (!name || !category) {
      return NextResponse.json({ message: "name and category are required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
    }
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { message: "image file is required (multipart field 'image')" },
        { status: 400 }
      );
    }

    await connectDB();
    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) {
      return NextResponse.json({ message: "Referenced category does not exist" }, { status: 400 });
    }

    const { url, publicId } = await uploadToCloudinary(imageFile);
    const product = await Product.create({
      name,
      category,
      description,
      imageUrl: url,
      imagePublicId: publicId,
    });
    await product.populate("category");
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
