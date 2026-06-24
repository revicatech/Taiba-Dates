import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function connectDB(): Promise<void> {
  if (global._mongooseConn) {
    await global._mongooseConn;
    return;
  }
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set");
  global._mongooseConn = mongoose.connect(uri);
  await global._mongooseConn;

  // Drop the legacy unique index on nameEN that was present in the original
  // Category schema. It is no longer needed (nameEN is now optional) and causes
  // duplicate-key errors when multiple categories have an empty nameEN.
  try {
    await mongoose.connection.collection("categories").dropIndex("nameEN_1");
  } catch {
    // Index doesn't exist or was already dropped — safe to ignore
  }
}
