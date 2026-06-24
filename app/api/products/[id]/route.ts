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
    const featuresRaw = formData.get("features") as string | null;
    const sizesRaw = formData.get("sizes") as string | null;

    if (nameAR !== null) update.nameAR = nameAR;
    if (nameEN !== null) update.nameEN = nameEN;
    if (description !== null) update.description = description;
    if (fullDescription !== null) update.fullDescription = fullDescription;
    if (featured !== null) update.featured = featured === "true";
    if (featuresRaw !== null) update.features = JSON.parse(featuresRaw);

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
      await connectDB();
      const sizesData: { subCategoryId?: string; label: string; imageUrl?: string; imagePublicId?: string }[] = JSON.parse(sizesRaw);
      const processedSizes = [];
      for (let i = 0; i < sizesData.length; i++) {
        const file = formData.get(`image_${i}`) as File | null;
        if (file && file.size > 0) {
          const { url, publicId } = await uploadToCloudinary(file);
          processedSizes.push({ subCategoryId: sizesData[i].subCategoryId ?? "", label: sizesData[i].label, imageUrl: url, imagePublicId: publicId });
        } else if (sizesData[i].imageUrl) {
          processedSizes.push({ subCategoryId: sizesData[i].subCategoryId ?? "", label: sizesData[i].label, imageUrl: sizesData[i].imageUrl!, imagePublicId: sizesData[i].imagePublicId! });
        } else {
          return NextResponse.json({ message: `صورة مطلوبة للحجم: ${sizesData[i].label}` }, { status: 400 });
        }
      }
      update.sizes = processedSizes;
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
    const { featured } = await req.json() as { featured: boolean };
    await connectDB();
    if (featured === true) {
      const count = await Product.countDocuments({ featured: true, _id: { $ne: id } });
      if (count >= 3) {
        return NextResponse.json({ message: "الحد الأقصى 3 منتجات مميزة على الصفحة الرئيسية" }, { status: 400 });
      }
    }
    const product = await Product.findByIdAndUpdate(id, { featured }, { new: true });
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json({ featured: product.featured });
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
