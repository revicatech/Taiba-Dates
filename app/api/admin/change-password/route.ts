import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { Admin } from "@/lib/models/Admin";
import { handleApiError } from "@/lib/api-error";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const admin = await requireAdmin();

    const { currentPassword, newPassword } = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // Reload with passwordHash (toJSON strips it, but the Mongoose doc has it)
    await connectDB();
    const doc = await Admin.findById(admin._id).select("+passwordHash");
    if (!doc) {
      return NextResponse.json({ message: "المشرف غير موجود" }, { status: 404 });
    }

    const match = await doc.comparePassword(currentPassword);
    if (!match) {
      return NextResponse.json({ message: "كلمة السر الحالية غير صحيحة" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
    }

    if (newPassword === currentPassword) {
      return NextResponse.json({ message: "كلمة السر الجديدة يجب أن تختلف عن الحالية" }, { status: 400 });
    }

    doc.passwordHash = await Admin.hashPassword(newPassword);
    await doc.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
