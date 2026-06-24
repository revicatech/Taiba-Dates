import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { id } = await params;
    await connectDB();
    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { id } = await params;
    await requireAdmin();
    const { nameAR, nameEN, subCategories } = await req.json();
    const update: Record<string, unknown> = {};
    if (nameAR !== undefined) update.nameAR = nameAR;
    if (nameEN !== undefined) update.nameEN = nameEN || undefined;
    if (subCategories !== undefined) {
      update.subCategories = subCategories.map((s: { nameAR: string; nameEN?: string }) => ({
        nameAR: s.nameAR,
        nameEN: s.nameEN || undefined,
      }));
    }
    await connectDB();
    const category = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { id } = await params;
    await requireAdmin();
    await connectDB();
    const inUse = await Product.exists({ category: id });
    if (inUse) {
      return NextResponse.json(
        { message: "لا يمكن حذف فئة تحتوي على منتجات. احذف المنتجات أولاً." },
        { status: 409 }
      );
    }
    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
