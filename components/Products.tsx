import RevealOnScroll from "@/components/RevealOnScroll";
import { fetchProducts } from "@/data/products";

export default async function Products() {
  const products = await fetchProducts({ limit: 3, featuredOnly: true });

  return (
    <section className="products" id="products">
      <div className="container">
        <RevealOnScroll className="products-header">
          <span className="section-eyebrow">Our Collection — مجموعتنا</span>
          <h2 className="section-title-ar">أجود التمور الفاخرة</h2>
          <p className="section-title-en">Premium Date Varieties</p>
          <p className="section-desc">
            من المجدول الملكي إلى العجوة النبوية — كل صنف يخبر حكاية أرض وتاريخ.
          </p>
        </RevealOnScroll>

        {products.length === 0 ? (
          <RevealOnScroll style={{ textAlign: "center", padding: "64px 24px", color: "var(--color-text-muted)" }}>
            <p>سيتم عرض المنتجات قريبًا.</p>
          </RevealOnScroll>
        ) : (
          <div className="products-grid">
            {products.map((p, i) => {
              const coverImage = p.sizes[0]?.imageUrl ?? "";
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
                      {p.description && <p className="product-description">{p.description}</p>}
                      {p.sizes.length > 0 && (
                        <div className="product-weights">
                          {p.sizes.map((s) => (
                            <span key={s.label} className="weight-pill">{s.label}</span>
                          ))}
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

        <RevealOnScroll style={{ textAlign: "center", marginTop: 56 }}>
          <a href="/products" className="btn-secondary">عرض جميع المنتجات</a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
