import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();
    const { nameEN, nameAR } = await req.json();
    if (!nameEN || !nameAR) {
      return NextResponse.json(
        { message: "nameEN and nameAR are required" },
        { status: 400 }
      );
    }
    await connectDB();
    const category = await Category.create({ nameEN, nameAR });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
