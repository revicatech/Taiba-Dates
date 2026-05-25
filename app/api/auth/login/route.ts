import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/Admin";
import { handleApiError } from "@/lib/api-error";

const COOKIE_NAME = "token";
const PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { message: "username and password are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const admin = await Admin.findOne({ username: String(username).toLowerCase().trim() });
    const INVALID = { message: "Invalid username or password" };
    if (!admin) return NextResponse.json(INVALID, { status: 401 });

    const ok = await admin.comparePassword(password);
    if (!ok) return NextResponse.json(INVALID, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ sub: admin._id.toString(), username: admin.username })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    const response = NextResponse.json({ admin: admin.toJSON() });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: PROD,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: "/",
    });
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
