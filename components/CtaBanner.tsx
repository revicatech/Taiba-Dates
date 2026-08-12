import RevealOnScroll from "@/components/RevealOnScroll";

export default function CtaBanner() {
  return (
    <>
    <section className="cta-banner">
      <div className="cta-banner-geo" />
      <div className="container">
        <RevealOnScroll className="cta-content">
          <h2 className="cta-title-ar">أهدِ من يستحق أجود التمور</h2>
          <p className="cta-title-en">Gift the Finest Dates</p>
          <p className="cta-desc">
            سواء كانت مناسبة عيد أو زفاف أو مجرد كرمك الخليجي الأصيل — طيبة تجعل كل لحظة أحلى.
          </p>
          <div className="cta-actions">
            <a
              href="https://wa.me/96176993533"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              تواصل معنا
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>

    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <RevealOnScroll>
          <p className="section-eyebrow"><span className="section-eyebrow-ar">تواصل معنا</span> — Contact Us</p>
          <h2 className="contact-section-title">نحن هنا لخدمتك</h2>
        </RevealOnScroll>

        <div className="contact-grid">
          <RevealOnScroll className="contact-info-col">

            <div className="contact-card">
              <div className="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                </svg>
              </div>
              <div>
                <p className="contact-card-label">رقم الهاتف</p>
                <p className="contact-card-value">
                  <a href="tel:+96176993533" dir="ltr">+961 76 993 533</a>
                </p>
              </div>
            </div>

            <div className="contact-card contact-card--tall">
              <div className="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="contact-card-label">الموقع</p>
                <p className="contact-card-value">البقاع الأوسط، تعناييل</p>
                <p className="contact-card-note">خلف كسكادا مول</p>
              </div>
            </div>

            <div className="contact-card contact-card--tall">
              <div className="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <p className="contact-card-label">الشحن</p>
                <p className="contact-card-value">الشحن الدولي متاح</p>
                <p className="contact-card-note">طلبيات مؤسسات وشركات بالجملة</p>
              </div>
            </div>

          </RevealOnScroll>

          <RevealOnScroll className="contact-map-col" style={{ transitionDelay: "150ms" }}>
            <div className="contact-map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3204.1970438043854!2d35.877117000000005!3d33.774269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDQ2JzI3LjQiTiAzNcKwNTInMzcuNiJF!5e1!3m2!1sen!2sno!4v1781698849041!5m2!1sen!2sno"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقع طيبة للتمور"
              />
            </div>
            <a
              href="https://wa.me/96176993533"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-wa-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              تواصل معنا عبر واتساب
            </a>
          </RevealOnScroll>
        </div>
      </div>
    </section>
    </>
  );
}
