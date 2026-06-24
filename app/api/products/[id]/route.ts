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
      // sizes JSON carries kept (already-uploaded) images per size
      const sizesData: { subCategoryId?: string; label: string; images?: { url: string; publicId: string }[] }[] = JSON.parse(sizesRaw);
      const processedSizes = [];

      for (let si = 0; si < sizesData.length; si++) {
        // Start with kept images from the form JSON
        const kept = (sizesData[si].images ?? []).filter((img) => img.url);
        // Upload any new files: image_{si}_0, image_{si}_1, ...
        const newImages: { url: string; publicId: string }[] = [];
        let imgIdx = 0;
        while (true) {
          const file = formData.get(`image_${si}_${imgIdx}`) as File | null;
          if (!file || file.size === 0) break;
          const { url, publicId } = await uploadToCloudinary(file);
          newImages.push({ url, publicId });
          imgIdx++;
        }
        const allImages = [...kept, ...newImages];
        if (allImages.length === 0) {
          return NextResponse.json({ message: `صورة واحدة على الأقل مطلوبة للحجم: ${sizesData[si].label}` }, { status: 400 });
        }
        processedSizes.push({
          subCategoryId: sizesData[si].subCategoryId ?? "",
          label: sizesData[si].label,
          images: allImages,
        });
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
