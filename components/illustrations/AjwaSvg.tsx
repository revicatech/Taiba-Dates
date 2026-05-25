export default function AjwaSvg() {
  return (
    <svg
      viewBox="0 0 360 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="date-illustration"
      style={{ position: "static", width: "100%", height: 270 }}
    >
      <rect width="360" height="270" fill="url(#p2bg)" />
      <defs>
        <radialGradient id="p2bg" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0d0d1a" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="135" r="100" fill="rgba(244,175,46,0.06)" />
      <ellipse cx="130" cy="160" rx="20" ry="28" fill="#1A0A08" transform="rotate(-10 130 160)" />
      <ellipse cx="128" cy="158" rx="18" ry="25" fill="#2A1008" transform="rotate(-10 128 158)" />

      <ellipse cx="155" cy="135" rx="22" ry="30" fill="#150808" />
      <ellipse cx="153" cy="133" rx="19" ry="27" fill="#250E0A" />
      <ellipse cx="156" cy="127" rx="7" ry="10" fill="rgba(200,100,30,0.3)" />

      <ellipse cx="185" cy="155" rx="21" ry="29" fill="#1A0A08" transform="rotate(5 185 155)" />
      <ellipse cx="183" cy="153" rx="19" ry="26" fill="#2A1008" transform="rotate(5 183 153)" />

      <ellipse cx="215" cy="130" rx="22" ry="30" fill="#150808" transform="rotate(-8 215 130)" />
      <ellipse cx="213" cy="128" rx="20" ry="27" fill="#250E0A" transform="rotate(-8 213 128)" />

      <ellipse cx="240" cy="155" rx="19" ry="27" fill="#1A0A08" transform="rotate(10 240 155)" />
      <ellipse cx="238" cy="153" rx="17" ry="24" fill="#2A1008" transform="rotate(10 238 153)" />

      <ellipse cx="170" cy="108" rx="17" ry="24" fill="#150808" transform="rotate(5 170 108)" />
      <ellipse cx="200" cy="112" rx="18" ry="25" fill="#1A0A08" transform="rotate(-5 200 112)" />

      <text x="180" y="250" textAnchor="middle" fontFamily="'Cairo',sans-serif" fontSize="16" fill="rgba(244,175,46,0.5)" fontWeight="700">عجوة المدينة</text>
    </svg>
  );
}
