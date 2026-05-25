import RevealOnScroll from "@/components/RevealOnScroll";

export default function CtaBanner() {
  return (
    <section className="cta-banner">
      <div className="cta-banner-geo" />
      <div className="container">
        <RevealOnScroll className="cta-content">
          <h2 className="cta-title-ar">أهدِ من يستحق أجود التمور</h2>
          <p className="cta-title-en">Gift the Finest Dates</p>
          <p className="cta-desc">
            سواء كانت مناسبة عيد أو زفاف أو مجرد كرمك الخليجي الأصيل — طيبه تجعل كل لحظة أحلى.
          </p>
          <div className="cta-actions">
            <a href="tel:+966500000000" className="btn-ghost">تواصل معنا</a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
