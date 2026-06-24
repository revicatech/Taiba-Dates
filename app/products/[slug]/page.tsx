import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductWeightSelector from "@/components/ProductWeightSelector";
import { fetchProductBySlug } from "@/data/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "منتج غير موجود" };
  return {
    title: `${product.nameAR} — طيبه للتمور`,
    description: product.description || product.fullDescription,
  };
}

const WHATSAPP_NUMBER = "96176993533";

const FEATURE_ICONS: Record<string, string> = {
  "100% Natural": "🌴",
  "طبيعي 100%": "🌴",
  "Premium Packaging": "📦",
  "تغليف فاخر": "📦",
  "Fast Shipping": "🚚",
  "شحن سريع": "🚚",
  "High Quality": "⭐",
  "جودة عالية": "⭐",
  "Handpicked": "✋",
  "مختار بعناية": "✋",
  "Corporate Gifts": "🎁",
  "هدايا مؤسسية": "🎁",
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  return (
    <>
      <Navbar />

      <main className="product-detail-page">
        <div className="container">

          <RevealOnScroll className="product-detail-breadcrumb">
            <a href="/">الرئيسية</a>
            <span>/</span>
            <a href="/products">المنتجات</a>
            <span>/</span>
            <span>{product.nameAR}</span>
          </RevealOnScroll>

          <div className="product-detail-grid">

            {/* Image */}
            <RevealOnScroll className="product-detail-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.nameAR}
                className="product-detail-image"
              />
            </RevealOnScroll>

            {/* Info */}
            <RevealOnScroll className="product-detail-info" style={{ transitionDelay: "100ms" }}>
              {product.category && (
                <span className="product-detail-category">
                  {product.category.nameAR}
                  {product.category.nameEN ? ` — ${product.category.nameEN}` : ""}
                </span>
              )}

              <h1 className="product-detail-name-ar">{product.nameAR}</h1>
              {product.nameEN && (
                <p className="product-detail-name-en">{product.nameEN}</p>
              )}

              {product.description && (
                <p className="product-detail-short-desc">{product.description}</p>
              )}

              {product.fullDescription && (
                <div className="product-detail-full-desc">
                  <p>{product.fullDescription}</p>
                </div>
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

              <ProductWeightSelector
                weights={product.weights}
                productNameAR={product.nameAR}
                productNameEN={product.nameEN}
                whatsappNumber={WHATSAPP_NUMBER}
              />
            </RevealOnScroll>

          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
}
