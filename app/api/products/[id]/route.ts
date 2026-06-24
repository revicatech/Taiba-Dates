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
    const slug = formData.get("slug") as string | null;
    const description = formData.get("description") as string | null;
    const fullDescription = formData.get("fullDescription") as string | null;
    const category = formData.get("category") as string | null;
    const featured = formData.get("featured");
    const weightsRaw = formData.get("weights") as string | null;
    const featuresRaw = formData.get("features") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (nameAR !== null) update.nameAR = nameAR;
    if (nameEN !== null) update.nameEN = nameEN;
    if (slug !== null) update.slug = slug;
    if (description !== null) update.description = description;
    if (fullDescription !== null) update.fullDescription = fullDescription;
    if (featured !== null) update.featured = featured === "true";
    if (weightsRaw !== null) update.weights = JSON.parse(weightsRaw);
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

    if (imageFile && imageFile.size > 0) {
      const { url, publicId } = await uploadToCloudinary(imageFile);
      update.imageUrl = url;
      update.imagePublicId = publicId;
    }

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate("category");

    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
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
