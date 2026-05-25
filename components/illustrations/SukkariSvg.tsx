export default function SukkariSvg() {
  return (
    <svg
      viewBox="0 0 360 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="date-illustration"
      style={{ position: "static", width: "100%", height: 270 }}
    >
      <rect width="360" height="270" fill="url(#p3bg)" />
      <defs>
        <radialGradient id="p3bg" cx="40%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#2e1e0a" />
          <stop offset="100%" stopColor="#180e04" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="135" r="105" fill="rgba(244,175,46,0.07)" />

      <ellipse cx="145" cy="150" rx="26" ry="40" fill="#8B5A0E" transform="rotate(-12 145 150)" />
      <ellipse cx="143" cy="148" rx="23" ry="36" fill="#B07520" transform="rotate(-12 143 148)" />
      <ellipse cx="147" cy="142" rx="9" ry="14" fill="rgba(255,200,80,0.3)" transform="rotate(-12 147 142)" />

      <ellipse cx="183" cy="130" rx="28" ry="44" fill="#7A4C0A" />
      <ellipse cx="181" cy="128" rx="25" ry="40" fill="#9E6218" />
      <ellipse cx="185" cy="121" rx="10" ry="16" fill="rgba(255,200,80,0.35)" />

      <ellipse cx="222" cy="148" rx="25" ry="39" fill="#8B5A0E" transform="rotate(10 222 148)" />
      <ellipse cx="220" cy="146" rx="22" ry="35" fill="#B07520" transform="rotate(10 220 146)" />
      <ellipse cx="224" cy="140" rx="9" ry="13" fill="rgba(255,200,80,0.3)" transform="rotate(10 224 140)" />

      <ellipse cx="115" cy="135" rx="18" ry="28" fill="#9E6218" transform="rotate(-20 115 135)" />
      <ellipse cx="252" cy="135" rx="18" ry="28" fill="#9E6218" transform="rotate(20 252 135)" />

      <circle cx="180" cy="135" r="80" fill="rgba(244,175,46,0.05)" />

      <text x="180" y="250" textAnchor="middle" fontFamily="'Cairo',sans-serif" fontSize="16" fill="rgba(244,175,46,0.5)" fontWeight="700">تمر السكري</text>
    </svg>
  );
}
