import type { MetadataRoute } from "next";
import { fetchProducts } from "@/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tibafordates.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProducts();

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p._id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productUrls,
  ];
}
