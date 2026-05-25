export default function Divider() {
  return (
    <div style={{ padding: "48px 0", background: "var(--color-bg)" }}>
      <div className="divider">
        <div className="divider-line" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="divider-icon">
          <path d="M12 2 L12 8 M8 4 Q10 8 12 8 Q14 8 16 4" stroke="#F4AF2E" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="12" cy="14" rx="4" ry="6" fill="#F4AF2E" opacity="0.9" />
          <path d="M8 10 Q9 14 12 14 Q15 14 16 10" stroke="#C49A40" strokeWidth="1" fill="none" />
        </svg>
        <div className="divider-line" />
      </div>
    </div>
  );
}
