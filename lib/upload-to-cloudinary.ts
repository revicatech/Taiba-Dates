import cloudinary from "@/lib/cloudinary";

export async function uploadToCloudinary(
  file: File
): Promise<{ url: string; publicId: string }> {
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!ALLOWED.includes(file.type)) {
    const err = Object.assign(new Error("Only jpg, png, webp, heic images are allowed"), { status: 400 });
    throw err;
  }
  if (file.size > 20 * 1024 * 1024) {
    const err = Object.assign(new Error("Image must be under 20 MB"), { status: 400 });
    throw err;
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "taiba/products", allowed_formats: ["jpg", "jpeg", "png", "webp", "heic", "heif"] },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}
