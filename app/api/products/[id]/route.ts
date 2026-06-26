import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Category } from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth-middleware";
import { uploadToCloudinary } from "@/lib/upload-to-cloudinary";
import { handleApiError } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id).populate("category");
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { id } = await params;
    await requireAdmin();
    const formData = await req.formData();
    const update: Record<string, unknown> = {};

    const nameAR = formData.get("nameAR") as string | null;
    const nameEN = formData.get("nameEN") as string | null;
    const description = formData.get("description") as string | null;
    const fullDescription = formData.get("fullDescription") as string | null;
    const category = formData.get("category") as string | null;
    const featured = formData.get("featured");
    const soldOut = formData.get("soldOut");
    const featuresRaw = formData.get("features") as string | null;
    const sizesRaw = formData.get("sizes") as string | null;
    const subCategoryIdsRaw = formData.get("subCategoryIds") as string | null;
    const keptImagesRaw = formData.get("keptImages") as string | null;

    if (nameAR !== null) update.nameAR = nameAR;
    if (nameEN !== null) update.nameEN = nameEN;
    if (description !== null) update.description = description;
    if (fullDescription !== null) update.fullDescription = fullDescription;
    if (featured !== null) update.featured = featured === "true";
    if (soldOut !== null) update.soldOut = soldOut === "true";
    if (featuresRaw !== null) update.features = JSON.parse(featuresRaw);
    if (subCategoryIdsRaw !== null) update.subCategoryIds = JSON.parse(subCategoryIdsRaw);

    if (category !== null) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
      }
      await connectDB();
      const categoryExists = await Category.exists({ _id: category });
      if (!categoryExists) {
        return NextResponse.json({ message: "Referenced category does not exist" }, { status: 400 });
      }
      update.category = category;
    }

    if (sizesRaw !== null) {
      const sizesData: { label: string }[] = JSON.parse(sizesRaw);
      update.sizes = sizesData.filter((s) => s.label).map((s) => ({ label: s.label }));
    }

    if (keptImagesRaw !== null) {
      await connectDB();
      const kept: { url: string; publicId: string }[] = JSON.parse(keptImagesRaw);
      const newImages: { url: string; publicId: string }[] = [];
      let imgIdx = 0;
      while (true) {
        const file = formData.get(`image_${imgIdx}`) as File | null;
        if (!file || file.size === 0) break;
        const { url, publicId } = await uploadToCloudinary(file);
        newImages.push({ url, publicId });
        imgIdx++;
      }
      update.images = [...kept, ...newImages];
    }

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate("category");
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { id } = await params;
    await requireAdmin();
    const body = await req.json() as { featured?: boolean; soldOut?: boolean };
    await connectDB();

    const update: Record<string, unknown> = {};
    if (typeof body.featured === "boolean") {
      if (body.featured === true) {
        const count = await Product.countDocuments({ featured: true, _id: { $ne: id } });
        if (count >= 3) {
          return NextResponse.json({ message: "الحد الأقصى 3 منتجات مميزة على الصفحة الرئيسية" }, { status: 400 });
        }
      }
      update.featured = body.featured;
    }
    if (typeof body.soldOut === "boolean") {
      update.soldOut = body.soldOut;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json({ featured: product.featured, soldOut: product.soldOut });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { id } = await params;
    await requireAdmin();
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
