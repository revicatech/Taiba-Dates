import RevealOnScroll from "@/components/RevealOnScroll";

const stats = [
  { num: "15,000+", label: "عميل سعيد",          sub: "Happy Customers" },
  { num: "12",      label: "دولة نوصّل إليها",    sub: "Countries Served" },
  { num: "50+",     label: "صنفًا من التمور",     sub: "Date Varieties" },
  { num: "20+",     label: "سنة من الخبرة",       sub: "Years of Expertise" },
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
