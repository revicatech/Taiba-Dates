import { NextResponse } from "next/server";
import mongoose from "mongoose";

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
    return NextResponse.json({ message: "Validation failed", fields }, { status: 400 });
  }

  if (err instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      { message: `Invalid ${err.path}: ${err.value}` },
      { status: 400 }
    );
  }

  // MongoDB duplicate key
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    return NextResponse.json(
      { message: "Duplicate value", fields: (err as { keyValue?: unknown }).keyValue },
      { status: 409 }
    );
  }

  if (err instanceof Error && "status" in err) {
    return NextResponse.json(
      { message: err.message },
      { status: (err as Error & { status: number }).status }
    );
  }

  console.error(err);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}
