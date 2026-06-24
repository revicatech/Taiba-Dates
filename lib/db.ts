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

  // Drop stale unique indexes left over from previous schema versions.
  // Each call is wrapped individually so one failure doesn't block the others.
  const drop = async (col: string, idx: string) => {
    try { await mongoose.connection.collection(col).dropIndex(idx); } catch { /* already gone */ }
  };

  // categories: nameEN was unique in the original schema, now it's optional
  await drop("categories", "nameEN_1");

  // products: slug was unique when slugs were introduced, then removed entirely
  await drop("products", "slug_1");
  // products: name was the original single name field, replaced by nameAR/nameEN
  await drop("products", "name_1");
}
