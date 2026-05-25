export default function MedjoolSvg() {
  return (
    <svg
      viewBox="0 0 360 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="date-illustration"
      style={{ position: "static", width: "100%", height: 270 }}
    >
      <rect width="360" height="270" fill="url(#p1bg)" />
      <defs>
        <radialGradient id="p1bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#2d1420" />
          <stop offset="100%" stopColor="#1a0d14" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="135" r="100" fill="rgba(133,68,110,0.1)" />
      <ellipse cx="140" cy="145" rx="32" ry="52" fill="#5C2A0A" transform="rotate(-15 140 145)" />
      <ellipse cx="138" cy="143" rx="28" ry="48" fill="#7A3A0E" transform="rotate(-15 138 143)" />
      <ellipse cx="143" cy="138" rx="10" ry="16" fill="rgba(255,160,60,0.2)" transform="rotate(-15 143 138)" />

      <ellipse cx="185" cy="135" rx="34" ry="56" fill="#4A2208" />
      <ellipse cx="183" cy="133" rx="30" ry="52" fill="#6B3410" />
      <ellipse cx="188" cy="127" rx="11" ry="18" fill="rgba(255,160,60,0.25)" />

      <ellipse cx="232" cy="148" rx="30" ry="50" fill="#5C2A0A" transform="rotate(12 232 148)" />
      <ellipse cx="230" cy="146" rx="26" ry="46" fill="#7A3A0E" transform="rotate(12 230 146)" />
      <ellipse cx="234" cy="140" rx="9" ry="15" fill="rgba(255,160,60,0.2)" transform="rotate(12 234 140)" />

      <circle cx="180" cy="135" r="90" fill="rgba(244,175,46,0.05)" />
      <text x="180" y="250" textAnchor="middle" fontFamily="'Cairo',sans-serif" fontSize="16" fill="rgba(244,175,46,0.5)" fontWeight="700">مجدول ملكي</text>
    </svg>
  );
}
