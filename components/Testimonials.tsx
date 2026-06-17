import RevealOnScroll from "@/components/RevealOnScroll";

const stats = [
  { num: "100%",    label: "طبيعي وأصيل",         sub: "Natural & Authentic" },
  { num: "50+",     label: "صنف من التمور",        sub: "Date Varieties" },
  { num: "20+",     label: "سنة من الخبرة",        sub: "Years of Expertise" },
];

export default function Testimonials() {
  return (
    <section className="stats-section" id="testimonials">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <RevealOnScroll
            key={i}
            className="stats-item"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <span className="stats-num">{s.num}</span>
            <span className="stats-label">{s.label}</span>
            <span className="stats-sub">{s.sub}</span>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
