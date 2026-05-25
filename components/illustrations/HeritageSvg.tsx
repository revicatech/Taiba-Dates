export default function HeritageSvg() {
  return (
    <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="400" height="500" fill="url(#heritageBg)" />
      <defs>
        <radialGradient id="heritageBg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#3d1f3a" />
          <stop offset="100%" stopColor="#1a0d1e" />
        </radialGradient>
        <radialGradient id="bowlGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(244,175,46,0.3)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="bowlFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B4012" />
          <stop offset="100%" stopColor="#3d2008" />
        </linearGradient>
      </defs>

      <g opacity="0.12">
        <circle cx="200" cy="80" r="60" stroke="#F4AF2E" strokeWidth="1" />
        <circle cx="200" cy="80" r="40" stroke="#85446E" strokeWidth="1" />
        <circle cx="200" cy="80" r="20" stroke="#F4AF2E" strokeWidth="1" />
        <line x1="140" y1="80" x2="260" y2="80" stroke="#F4AF2E" strokeWidth="0.5" />
        <line x1="200" y1="20" x2="200" y2="140" stroke="#F4AF2E" strokeWidth="0.5" />
        <line x1="157" y1="37" x2="243" y2="123" stroke="#85446E" strokeWidth="0.5" />
        <line x1="243" y1="37" x2="157" y2="123" stroke="#85446E" strokeWidth="0.5" />
      </g>

      <ellipse cx="200" cy="380" rx="130" ry="30" fill="rgba(244,175,46,0.08)" />
      <path d="M80 330 Q100 400 200 410 Q300 400 320 330 Q310 290 200 285 Q90 290 80 330Z" fill="url(#bowlFill)" stroke="#8B5E1A" strokeWidth="2" />
      <path d="M85 330 Q105 395 200 405 Q295 395 315 330" stroke="rgba(180,120,40,0.4)" strokeWidth="3" fill="none" />

      <ellipse cx="160" cy="310" rx="22" ry="16" fill="#8B4A0E" transform="rotate(-20 160 310)" />
      <ellipse cx="158" cy="308" rx="20" ry="14" fill="#A0580F" transform="rotate(-20 158 308)" />
      <ellipse cx="163" cy="305" rx="8" ry="5" fill="rgba(255,180,80,0.25)" transform="rotate(-20 163 305)" />

      <ellipse cx="200" cy="300" rx="24" ry="17" fill="#7A3D0C" />
      <ellipse cx="200" cy="298" rx="22" ry="15" fill="#954A0E" />
      <ellipse cx="204" cy="295" rx="9" ry="5" fill="rgba(255,180,80,0.2)" />

      <ellipse cx="240" cy="308" rx="22" ry="16" fill="#8B4A0E" transform="rotate(15 240 308)" />
      <ellipse cx="238" cy="306" rx="20" ry="14" fill="#A0580F" transform="rotate(15 238 306)" />
      <ellipse cx="243" cy="303" rx="8" ry="5" fill="rgba(255,180,80,0.25)" transform="rotate(15 243 303)" />

      <ellipse cx="180" cy="295" rx="20" ry="14" fill="#6A3008" transform="rotate(10 180 295)" />
      <ellipse cx="178" cy="293" rx="18" ry="12" fill="#8B4A0E" transform="rotate(10 178 293)" />

      <ellipse cx="220" cy="292" rx="21" ry="15" fill="#7A3D0C" transform="rotate(-10 220 292)" />
      <ellipse cx="218" cy="290" rx="19" ry="13" fill="#954A0E" transform="rotate(-10 218 290)" />

      <ellipse cx="140" cy="320" rx="16" ry="12" fill="#A0580F" transform="rotate(25 140 320)" />
      <ellipse cx="262" cy="318" rx="16" ry="12" fill="#8B4A0E" transform="rotate(-20 262 318)" />
      <ellipse cx="200" cy="280" rx="17" ry="13" fill="#7A3D0C" transform="rotate(5 200 280)" />

      <ellipse cx="200" cy="350" rx="100" ry="40" fill="url(#bowlGlow)" opacity="0.5" />

      <line x1="200" y1="0" x2="200" y2="250" stroke="rgba(244,175,46,0.06)" strokeWidth="60" />
      <line x1="100" y1="0" x2="300" y2="500" stroke="rgba(133,68,110,0.04)" strokeWidth="40" />

      <text x="200" y="465" textAnchor="middle" fontFamily="'Cairo', sans-serif" fontSize="22" fontWeight="700" fill="rgba(244,175,46,0.7)">
        تمور فاخرة
      </text>
      <text x="200" y="485" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="11" fontWeight="600" letterSpacing="4" fill="rgba(255,255,255,0.25)">
        PREMIUM DATES
      </text>
    </svg>
  );
}
