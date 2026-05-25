import HeritageSvg from "@/components/illustrations/HeritageSvg";
import RevealOnScroll from "@/components/RevealOnScroll";

const statNumStyle = {
  fontFamily: "var(--font-latin-display)",
  fontSize: 36,
  fontWeight: 700,
  color: "var(--color-secondary)",
  lineHeight: 1,
} as const;

const statLabelStyle = {
  fontSize: 13,
  color: "var(--color-text-muted)",
  marginTop: 4,
} as const;

export default function Heritage() {
  return (
    <section className="heritage" id="heritage">
      <div className="container">
        <div className="heritage-inner">
          <RevealOnScroll className="heritage-visual">
            <div className="heritage-border-frame" />
            <div className="heritage-img-frame">
              <div className="frame-inner-bg">
                <HeritageSvg />
              </div>
            </div>
            <div className="heritage-accent-box">
              <div className="heritage-accent-num">30+</div>
              <div className="heritage-accent-label">سنة من الخبرة</div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <span className="section-eyebrow">Our Heritage — إرثنا</span>
            <h2 className="section-title-ar">
              من قلب الخليج<br />إلى مائدتكم
            </h2>
            <p className="section-title-en">From the Gulf to Your Table</p>
            <p className="section-desc" style={{ marginBottom: 28 }}>
              تأسست طيبه للتمور على عشق أصيل للتمر الخليجي وحرفة الانتقاء الدقيق. نجوب مزارع الأحساء والمدينة المنورة وسلطنة عُمان باحثين عن أندر الأصناف وأجودها.
            </p>
            <p className="section-desc" style={{ marginBottom: 48 }}>
              كل صندوق طيبه يحمل وعدًا: تمرة اخترناها بأيدينا، عُولجت بأدق المعايير، وصلت إليكم في أوج نضجها وعطائها.
            </p>
            <div style={{ display: "flex", gap: 32, marginBottom: 48 }}>
              <div>
                <div style={statNumStyle}>15K+</div>
                <div style={statLabelStyle}>عميل في 12 دولة</div>
              </div>
              <div style={{ width: 1, background: "var(--color-border)" }} />
              <div>
                <div style={statNumStyle}>50+</div>
                <div style={statLabelStyle}>صنف من التمور</div>
              </div>
              <div style={{ width: 1, background: "var(--color-border)" }} />
              <div>
                <div style={statNumStyle}>100%</div>
                <div style={statLabelStyle}>طبيعي وخالٍ من الإضافات</div>
              </div>
            </div>
            <a href="/products" className="btn-primary">تصفح المنتجات</a>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
