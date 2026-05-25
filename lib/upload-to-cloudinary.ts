import cloudinary from "@/lib/cloudinary";

export async function uploadToCloudinary(
  file: File
): Promise<{ url: string; publicId: string }> {
  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
  if (!ALLOWED.includes(file.type)) {
    const err = Object.assign(new Error("Only jpg, png, webp images are allowed"), { status: 400 });
    throw err;
  }
  if (file.size > 5 * 1024 * 1024) {
    const err = Object.assign(new Error("Image must be under 5 MB"), { status: 400 });
    throw err;
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "taiba/products", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}
