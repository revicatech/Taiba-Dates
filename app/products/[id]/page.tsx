export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductDetailClient from "@/components/ProductDetailClient";
import { fetchProductById } from "@/data/products";

type Props = { params: Promise<{ id: string }> };

const WHATSAPP_NUMBER = "96176993533";

const FEATURE_ICONS: Record<string, string> = {
  "100% Natural": "🌴", "طبيعي 100%": "🌴",
  "Premium Packaging": "📦", "تغليف فاخر": "📦",
  "Fast Shipping": "🚚", "شحن سريع": "🚚",
  "High Quality": "⭐", "جودة عالية": "⭐",
  "Handpicked": "✋", "مختار بعناية": "✋",
  "Corporate Gifts": "🎁", "هدايا مؤسسية": "🎁",
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) notFound();

  const subCategories = product.category?.subCategories ?? [];

  return (
    <>
      <Navbar solid />
      <main className="product-detail-page">
        <div className="container">

          <RevealOnScroll className="product-detail-breadcrumb">
            <a href="/">الرئيسية</a>
            <span>/</span>
            <a href="/products">المنتجات</a>
            <span>/</span>
            <span>{product.nameAR}</span>
          </RevealOnScroll>

          <div className="product-detail-top">
            {/* Info panel */}
            <RevealOnScroll className="product-detail-info">
              {product.category && (
                <span className="product-detail-category">
                  {product.category.nameAR}{product.category.nameEN ? ` — ${product.category.nameEN}` : ""}
                </span>
              )}
              <h1 className="product-detail-name-ar">{product.nameAR}</h1>
              {product.nameEN && <p className="product-detail-name-en">{product.nameEN}</p>}

              {product.description && (
                <p className="product-detail-short-desc">{product.description}</p>
              )}


              {product.features.length > 0 && (
                <ul className="product-detail-features">
                  {product.features.map((f) => (
                    <li key={f}>
                      <span className="feature-icon">{FEATURE_ICONS[f] ?? "✦"}</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </RevealOnScroll>
          </div>

          {/* Interactive gallery + selector */}
          {product.sizes.length > 0 && (
            <ProductDetailClient
              sizes={product.sizes}
              subCategories={subCategories}
              productNameAR={product.nameAR}
              productNameEN={product.nameEN}
              whatsappNumber={WHATSAPP_NUMBER}
            />
          )}

        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
