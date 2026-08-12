import Image from "next/image";
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
              <Image
                src="/assets/store.jpeg"
                alt="متجر طيبة للتمور"
                fill
                style={{ objectFit: "cover", objectPosition: "center top" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="heritage-accent-box">
              <div className="heritage-accent-num">15+</div>
              <div className="heritage-accent-label">سنة من الخبرة</div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <span className="section-eyebrow">Our Heritage — <span className="section-eyebrow-ar">إرثنا</span></span>
            <h2 className="section-title-ar">
              من قلب الخليج<br />إلى مائدتكم
            </h2>
            <p className="section-title-en">From the Gulf to Your Table</p>
            <p className="section-desc" style={{ marginBottom: 28 }}>
              تأسست "طيبة للتمور" سنة 2011، من عشق أصيل للتمر الخليجي وحرفة الانتقاء الدقيق. بدأنا بعد سنوات من الخبرة في بيع التمر، وأسسنا شركة صغيرة لم تتوقف عن النمو منذ يومها الأول.
            </p>
            <p className="section-desc" style={{ marginBottom: 28 }}>
              نتجول في مزارع القصيم والغاط والمدينة المنورة، وصولًا إلى الأغوار الأردنية، باحثين عن أجود الأصناف وأكثرها نقاءً. وكل صندوق يحمل اسم "طيبة" يحمل معه وعدًا لا نحيد عنه: تمرة اخترناها بأيدينا بأدق المعايير، ووصلت إليكم في أوج نضجها وعطائها.
            </p>
            <p className="section-desc" style={{ marginBottom: 28 }}>
              على مدى السنين، كبرت معنا الثقة، حتى وصلنا لخدمة أكثر من 2000 عميل اختاروا "طيبة" واستمروا معنا. لم يكن الطريق دائمًا سهلًا؛ فسنة 2020 كانت من أصعب السنوات التي مررنا بها، لكن وفاء عملائنا وثقتهم بنا كانا السبب الذي مكّننا من العودة أقوى من قبل.
            </p>
            <p className="section-desc" style={{ marginBottom: 48 }}>
              ونحن في كل خطوة نخطوها، نبقى أوفياء لنفس الروح التي بدأنا بها وحرص لا يتغير على إيصاله إليكم بأفضل جودة ممكنة.
            </p>
            <div style={{ display: "flex", gap: 32, marginBottom: 48 }}>
              <div>
                <div style={statNumStyle}>100%</div>
                <div style={statLabelStyle}>طبيعي وأصيل</div>
              </div>
              <div style={{ width: 1, background: "var(--color-border)" }} />
              <div>
                <div style={statNumStyle}>50+</div>
                <div style={statLabelStyle}>صنف من التمور</div>
              </div>
              <div style={{ width: 1, background: "var(--color-border)" }} />
              <div>
                <div style={statNumStyle}>15+</div>
                <div style={statLabelStyle}>سنة من الخبرة</div>
              </div>
            </div>
            <a href="/products" className="btn-primary">تصفح المنتجات</a>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
