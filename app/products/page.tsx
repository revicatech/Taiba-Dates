export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProductsPageHero from "@/components/ProductsPageHero";
import CategoryFilter from "@/components/CategoryFilter";
import RevealOnScroll from "@/components/RevealOnScroll";
import { fetchProducts } from "@/data/products";
import { fetchCategories } from "@/data/categories";

type Props = { searchParams: { category?: string } };

export const metadata = {
  title: "المنتجات — Tiba For Dates",
  description: "تصفح مجموعتنا الفاخرة من أجود التمور الخليجية.",
};

export default async function ProductsPage({ searchParams }: Props) {
  const activeCategoryId = searchParams.category;
  const [products, categories] = await Promise.all([
    fetchProducts({ limit: 100, category: activeCategoryId }),
    fetchCategories(),
  ]);
  const activeCategory = activeCategoryId ? categories.find((c) => c._id === activeCategoryId) : undefined;

  return (
    <>
      <Navbar />
      <ProductsPageHero totalCount={products.length} activeCategoryName={activeCategory?.nameAR} />
      <section className="products-page-section">
        <div className="container">
          <CategoryFilter categories={categories} activeId={activeCategoryId} />
          {products.length === 0 ? (
            <RevealOnScroll style={{ textAlign: "center", padding: "96px 24px", color: "var(--color-text-muted)" }}>
              <p style={{ fontSize: 18 }}>
                {activeCategory ? `لا توجد منتجات في فئة "${activeCategory.nameAR}" حاليًا.` : "سيتم عرض المنتجات قريبًا."}
              </p>
            </RevealOnScroll>
          ) : (
            <div className="products-grid">
              {products.map((p, i) => {
                const coverImage = p.sizes[0]?.imageUrl ?? "";
                return (
                  <RevealOnScroll key={p._id} style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                    <a href={`/products/${p._id}`} className="product-card" style={{ textDecoration: "none", display: "block" }}>
                      <div className="product-img">
                        {coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={coverImage} alt={p.nameAR} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        )}
                      </div>
                      <div className="product-info">
                        {p.category && (
                          <span className="product-variety">{p.category.nameEN} — {p.category.nameAR}</span>
                        )}
                        <div className="product-name-ar">{p.nameAR}</div>
                        {p.nameEN && <div className="product-name-en">{p.nameEN}</div>}
                        {p.description && <p className="product-description">{p.description}</p>}
                        {p.sizes.length > 0 && (
                          <div className="product-weights">
                            <span className="weights-label">الأحجام:</span>
                            {p.sizes.map((s) => <span key={s.label} className="weight-pill">{s.label}</span>)}
                          </div>
                        )}
                        <div className="product-footer">
                          <span className="product-btn">عرض المنتج ←</span>
                        </div>
                      </div>
                    </a>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </>
  );
}
