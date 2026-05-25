import RevealOnScroll from "@/components/RevealOnScroll";
import { features } from "@/data/features";

export default function Features() {
  // Render two identical sets back-to-back so the CSS marquee loops seamlessly.
  const sets = [false, true];

  return (
    <section className="features" id="features">
      <div className="container">
        <RevealOnScroll className="features-header">
          <span className="section-eyebrow" style={{ color: "var(--color-secondary-light)" }}>
            Why Tiba — لماذا طيبه
          </span>
          <h2 className="section-title-ar" style={{ color: "var(--color-white)" }}>
            التميز في كل تفصيل
          </h2>
          <p className="section-title-en">Excellence in Every Detail</p>
          <p className="section-desc">
            التزامنا بالجودة لا يتوقف عند الانتقاء — بل يمتد إلى كل لمسة في رحلة التمرة.
          </p>
        </RevealOnScroll>

        <div className="features-slider">
          <div className="features-track" id="featuresTrack">
            {sets.flatMap((isClone) =>
              features.map((f, i) => (
                <div
                  key={`${isClone ? "b" : "a"}-${i}`}
                  className="feature-card"
                  aria-hidden={isClone || undefined}
                >
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
