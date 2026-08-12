import RevealOnScroll from "@/components/RevealOnScroll";
import { features } from "@/data/features";

// Map each feature to a bento grid slot size: hero, tall, wide, or small
const slotClasses = [
  "bento-hero",   // انتقاء يدوي  — large top-left
  "bento-tall",   // 100% طبيعي   — tall right column
  "bento-wide",   // تغليف فاخر  — wide bottom-left
  "bento-small",  // توصيل سريع  — small
  "bento-small",  // جودة معتمدة — small
  "bento-small",  // هدايا مخصصة — small
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <RevealOnScroll className="features-header">
          <span className="section-eyebrow" style={{ color: "var(--color-secondary-light)" }}>
            Why Tiba — <span className="section-eyebrow-ar">لماذا طيبة</span>
          </span>
          <h2 className="section-title-ar" style={{ color: "var(--color-white)" }}>
            التميز في كل تفصيل
          </h2>
          <p className="section-title-en">Excellence in Every Detail</p>
        </RevealOnScroll>

        <div className="bento-grid">
          {features.map((f, i) => (
            <RevealOnScroll
              key={i}
              className={`bento-card ${slotClasses[i] ?? "bento-small"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="bento-icon">{f.icon}</span>
              <div className="bento-body">
                <h3 className="bento-title">{f.title}</h3>
                <p className="bento-desc">{f.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
