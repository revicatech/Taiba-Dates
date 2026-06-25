import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner-new">

        <div className="footer-brand">
          <div className="footer-logo-img">
            <Logo size={88} />
          </div>
          <p className="footer-tagline">
            تمور فاخرة مُختارة بعناية من أفضل مزارع الخليج العربي.
          </p>
          <div className="footer-social">
            <a href="https://wa.me/96176993533" className="whatsapp" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
            <a href="#" className="social-btn" title="Twitter / X" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="social-btn" title="Instagram" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>منتجاتنا</h4>
          <ul>
            <li><a>تمر مدجول اردني</a></li>
            <li><a>تمر الصقعي</a></li>
            <li><a>تمر الصفاوي</a></li>
            <li><a>تمر خضري</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>خدماتنا</h4>
          <ul>
            <li><a>أجود أنواع التمور</a></li>
            <li><a>تغليف فاخر</a></li>
            <li><a>جودة مضمونة</a></li>
            <li><a>خدمة عملاء مميزة</a></li>
            <li><a>توصيل سريع</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p className="footer-designed">Designed by REVICA x Crazy Ads</p>
        <p className="footer-copy">© 2026 طيبه للتمور — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
}
