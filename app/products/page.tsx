export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProductsPageHero from "@/components/ProductsPageHero";
import CategoryFilter from "@/components/CategoryFilter";
import RevealOnScroll from "@/components/RevealOnScroll";
import { fetchProducts } from "@/data/products";
import { fetchCategories } from "@/data/categories";

type Props = { searchParams: { category?: string; sub?: string; unit?: string } };

export const metadata = {
  title: "المنتجات",
  description: "تصفح مجموعتنا الفاخرة من أجود التمور الخليجية — تمر سعودي، مدجول، تمر محشي وفواكه مجففة.",
  openGraph: {
    title: "منتجات طيبة للتمور",
    description: "تصفح مجموعتنا الفاخرة من أجود التمور الخليجية.",
    images: [{ url: "/assets/store.jpeg", alt: "منتجات طيبة للتمور" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "منتجات طيبة للتمور",
    description: "أجود التمور الخليجية — تمر سعودي، مدجول، تمر محشي وفواكه مجففة.",
    images: ["/assets/store.jpeg"],
  },
};

export default async function ProductsPage({ searchParams }: Props) {
  const activeCategoryId = searchParams.category;
  // A subcategory filter only applies within its category.
  const activeSubId = activeCategoryId ? searchParams.sub : undefined;
  const activeUnit = searchParams.unit === "box" || searchParams.unit === "piece" ? searchParams.unit : undefined;
  const [products, categories] = await Promise.all([
    fetchProducts({ limit: 100, category: activeCategoryId, subCategory: activeSubId, unit: activeUnit }),
    fetchCategories(),
  ]);
  const activeCategory = activeCategoryId ? categories.find((c) => c._id === activeCategoryId) : undefined;

  return (
    <>
      <Navbar solid />
      <ProductsPageHero totalCount={products.length} activeCategoryName={activeCategory?.nameAR} />
      <section className="products-page-section">
        <div className="container">
          <CategoryFilter categories={categories} activeId={activeCategoryId} activeSubId={activeSubId} activeUnit={activeUnit} />
          {products.length === 0 ? (
            <RevealOnScroll style={{ textAlign: "center", padding: "96px 24px", color: "var(--color-text-muted)" }}>
              <p style={{ fontSize: 18 }}>
                {activeCategory ? `لا توجد منتجات في فئة "${activeCategory.nameAR}" حاليًا.` : "سيتم عرض المنتجات قريبًا."}
              </p>
            </RevealOnScroll>
          ) : (
            <div className="products-grid">
              {products.map((p, i) => {
                const coverImage = p.images[0]?.url ?? "";
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
                          <span className="product-variety">{p.category.nameEN} — <span className="product-variety-ar">{p.category.nameAR}</span></span>
                        )}
                        <div className="product-name-ar">{p.nameAR}</div>
                        {p.nameEN && <div className="product-name-en">{p.nameEN}</div>}
                        {(() => {
                          const subCats = (p.subCategoryIds ?? [])
                            .map((id) => p.category?.subCategories?.find((s) => s._id === id))
                            .filter(Boolean) as { _id: string; nameAR: string }[];
                          return (subCats.length > 0 || p.grades.length > 0 || p.weights.length > 0) ? (
                            <div className="product-weights">
                              {subCats.map((s) => (
                                <span key={s._id} className="subcat-pill">{s.nameAR}</span>
                              ))}
                              {p.grades.map((g) => (
                                <span key={g} className="weight-pill">{g}</span>
                              ))}
                              {p.weights.map((w) => (
                                <span key={w} className="weight-pill">{w}</span>
                              ))}
                            </div>
                          ) : null;
                        })()}
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
