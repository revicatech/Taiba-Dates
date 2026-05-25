import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET(): Promise<NextResponse> {
  try {
    const admin = await requireAdmin();
    return NextResponse.json({ admin: admin.toJSON() });
  } catch (err) {
    return handleApiError(err);
  }
}
