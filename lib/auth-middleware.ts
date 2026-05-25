import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { Admin, IAdmin } from "@/lib/models/Admin";

export async function requireAdmin(): Promise<IAdmin> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw Object.assign(new Error("Not authenticated"), { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  let payload: { sub?: string };
  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload as { sub?: string };
  } catch {
    throw Object.assign(new Error("Invalid or expired token"), { status: 401 });
  }

  await connectDB();
  const admin = await Admin.findById(payload.sub);
  if (!admin) {
    throw Object.assign(new Error("Admin no longer exists"), { status: 401 });
  }
  return admin;
}
