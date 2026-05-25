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
}
