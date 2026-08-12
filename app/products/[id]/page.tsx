export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProductDetailClient from "@/components/ProductDetailClient";
import { fetchProductById, deriveVariants } from "@/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tibafordates.com";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return { title: "منتج غير موجود" };

  const title = product.nameEN
    ? `${product.nameAR} — ${product.nameEN}`
    : product.nameAR;
  const description =
    product.description ||
    `${product.nameAR} من طيبة للتمور — تمور فاخرة مختارة بعناية من أجود مزارع الخليج.`;
  const image = product.images?.[0]?.url ?? `${SITE_URL}/assets/store.jpeg`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "ar_SA",
      siteName: "طيبة للتمور",
      title,
      description,
      images: [{ url: image, alt: product.nameAR }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) notFound();

  const subCategories = product.category?.subCategories ?? [];
  const effectiveVariants = deriveVariants(product);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameAR,
    ...(product.nameEN ? { alternateName: product.nameEN } : {}),
    description: product.description,
    image: (product.images ?? []).map((img: { url: string }) => img.url),
    brand: { "@type": "Brand", name: "طيبة للتمور" },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product._id}`,
      seller: { "@type": "Organization", name: "طيبة للتمور" },
      priceCurrency: "SAR",
    },
    ...(product.category?.nameAR ? { category: product.category.nameAR } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar solid />

      <main className="pdv2-page">
        <div className="pdv2-container">

          {/* Breadcrumb */}
          <div className="pdv2-breadcrumb" aria-label="breadcrumb">
            <a href="/">الرئيسية</a>
            <span>/</span>
            <a href="/products">المنتجات</a>
            <span>/</span>
            <span>{product.nameAR}</span>
          </div>

          <ProductDetailClient
            productId={product._id}
            nameAR={product.nameAR}
            nameEN={product.nameEN}
            description={product.description}
            categoryNameAR={product.category?.nameAR ?? ""}
            categoryNameEN={product.category?.nameEN ?? ""}
            features={product.features}
            variants={effectiveVariants}
            subCategoryIds={product.subCategoryIds}
            subCategories={subCategories}
            images={product.images}
          />

        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
}
