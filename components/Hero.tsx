import PalmSvg from "@/components/illustrations/PalmSvg";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-geo" />
      <div className="hero-watermark">ط</div>

      <div className="hero-content">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-badge fade-up">
                <div className="dot" />
                <span>PREMIUM DATES FROM THE ARABIAN GULF</span>
              </div>
              <h1 className="hero-headline-ar fade-up delay-1">
                تمور <span className="gold">فاخرة</span>
                <br />
              من القلب للقلب
              </h1>
              <p className="hero-headline-en fade-up delay-2">Handpicked Heritage Dates</p>
              <p className="hero-desc fade-up delay-3">
                منذ أجيال، نختار أجود التمور من أفضل مزارع الخليج العربي و الأردن — كل تمرة حكاية من الأصالة والكرم والطعم الفريد.
              </p>
              <div className="hero-actions fade-up delay-4">
                <a href="/products" className="btn-primary">اكتشف مجموعتنا</a>
                <a href="#heritage" className="btn-secondary">قصتنا</a>
              </div>
            </div>

            <div className="hero-visual fade-up delay-2">
              <div className="hero-palm-container">
                <div className="hero-palm-glow" />
                <PalmSvg />
              </div>
            </div>
          </div>

          <div className="hero-stats fade-up delay-4">
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">طبيعي وأصيل</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">+50</span>
              <span className="hero-stat-label">صنف من التمور</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">15+</span>
              <span className="hero-stat-label">سنة من الخبرة</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
