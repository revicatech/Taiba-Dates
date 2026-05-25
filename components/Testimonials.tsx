import RevealOnScroll from "@/components/RevealOnScroll";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  // Duplicate set so the marquee can loop with translateX(-50%).
  const sets = [false, true];

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <RevealOnScroll className="testimonials-header">
          <span className="section-eyebrow">Customer Reviews — آراء عملائنا</span>
          <h2 className="section-title-ar">يقولون عن طيبه</h2>
          <p className="section-title-en">What Our Customers Say</p>
        </RevealOnScroll>
      </div>

      <div className="testimonials-track-wrapper">
        <div className="testimonials-track" id="testimonialsTrack">
          {sets.flatMap((isClone) =>
            testimonials.map((t, i) => (
              <div
                key={`${isClone ? "b" : "a"}-${i}`}
                className="testimonial-card"
                aria-hidden={isClone || undefined}
              >
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-location">{t.location}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
