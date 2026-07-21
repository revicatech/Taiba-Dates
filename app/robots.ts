import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tibafordates.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products"],
        disallow: ["/admin/", "/api/"],
      },
      // Allow AI crawlers that respect separate rules
      {
        userAgent: ["GPTBot", "anthropic-ai", "Claude-Web", "PerplexityBot", "GoogleOther"],
        allow: ["/", "/products"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
