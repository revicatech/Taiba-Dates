import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { Admin } from "@/lib/models/Admin";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // requireAdmin() returns the full Mongoose document — passwordHash is present
    // on the live doc even though toJSON strips it from serialised output.
    const admin = await requireAdmin();

    const { currentPassword, newPassword } = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const match = await admin.comparePassword(currentPassword);
    if (!match) {
      return NextResponse.json({ message: "كلمة السر الحالية غير صحيحة" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل" },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { message: "كلمة السر الجديدة يجب أن تختلف عن الحالية" },
        { status: 400 }
      );
    }

    admin.passwordHash = await Admin.hashPassword(newPassword);
    await admin.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
