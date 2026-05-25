import RevealOnScroll from "@/components/RevealOnScroll";
import { fetchProducts } from "@/data/products";

export default async function Products() {
  const products = await fetchProducts();

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
          <RevealOnScroll
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: "var(--color-text-muted)",
            }}
          >
            <p>سيتم عرض المنتجات قريبًا.</p>
          </RevealOnScroll>
        ) : (
          <div className="products-grid">
            {products.map((p, i) => (
              <RevealOnScroll
                key={p._id}
                className="product-card"
                style={{ transitionDelay: `${(i % 3) * 100}ms` }}
              >
                <div className="product-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <div className="product-info">
                  {p.category && (
                    <span className="product-variety">
                      {p.category.nameEN} — {p.category.nameAR}
                    </span>
                  )}
                  <div className="product-name-ar">{p.name}</div>
                  {p.description && (
                    <p className="product-description">{p.description}</p>
                  )}
                  <div className="product-footer" style={{ marginTop: 20 }}>
                    <span />
                    <button className="product-btn">اطلب الآن</button>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        )}

        <RevealOnScroll style={{ textAlign: "center", marginTop: 56 }}>
          <a href="/products" className="btn-secondary">عرض جميع المنتجات</a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
