import { unstable_noStore as noStore } from "next/cache";
import RevealOnScroll from "@/components/RevealOnScroll";
import { fetchOtherProducts } from "@/data/products";

export default async function OtherProducts() {
  noStore();
  const products = await fetchOtherProducts(12);

  // Hide the whole section when there are no non-dates products.
  if (products.length === 0) return null;

  return (
    <section className="products" id="other-products">
      <div className="container">
        <RevealOnScroll className="products-header">
          <span className="section-eyebrow">Other Products — منتجات أخرى</span>
          <h2 className="section-title-ar">منتجات أخرى</h2>
          <p className="section-title-en">More From Tiba</p>
          <p className="section-desc">
            تشكيلة مختارة من منتجاتنا المميزة إلى جانب التمور.
          </p>
        </RevealOnScroll>

        <div className="products-grid">
          {products.map((p, i) => {
            const coverImage = p.images[0]?.url ?? "";
            return (
              <RevealOnScroll key={p._id} style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
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
      </div>
    </section>
  );
}
