/**
 * HeroIllustration — a flat illustration of an Ethiopian student girl,
 * designed to replace the generic stock photo. Cues: braided hair with beads
 * and a white netela shawl with the green/yellow/red (Ethiopian flag) border.
 */
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 500"
      role="img"
      aria-label="Illustration of an Ethiopian student girl studying"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Soft background */}
      <circle cx="200" cy="240" r="185" fill="#E4F0F7" />
      <circle cx="78" cy="130" r="9" fill="#F59E0B" opacity="0.55" />
      <circle cx="330" cy="100" r="6" fill="#0096D6" opacity="0.5" />
      <circle cx="338" cy="340" r="11" fill="#22C55E" opacity="0.35" />
      <circle cx="66" cy="330" r="7" fill="#EF4444" opacity="0.3" />

      {/* Ground shadow */}
      <ellipse cx="200" cy="462" rx="120" ry="15" fill="#0F172A" opacity="0.06" />

      {/* Dress / torso */}
      <path d="M118 462 Q118 382 200 362 Q282 382 282 462 Z" fill="#0096D6" />

      {/* Netela shawl (white with Ethiopian flag border) */}
      <path
        d="M112 412 Q200 362 288 412 L288 438 Q200 418 112 438 Z"
        fill="#FFFFFF"
      />
      <rect x="112" y="434" width="176" height="6" rx="3" fill="#22C55E" />
      <rect x="112" y="440" width="176" height="6" rx="3" fill="#FDE047" />
      <rect x="112" y="446" width="176" height="6" rx="3" fill="#EF4444" />

      {/* Neck */}
      <rect x="186" y="300" width="28" height="46" rx="13" fill="#7A4A23" />

      {/* Head */}
      <circle cx="200" cy="232" r="64" fill="#8D5524" />

      {/* Face features */}
      <ellipse cx="179" cy="232" rx="4.5" ry="5.5" fill="#2E1A0F" />
      <ellipse cx="221" cy="232" rx="4.5" ry="5.5" fill="#2E1A0F" />
      <path
        d="M190 256 Q200 267 210 256"
        stroke="#2E1A0F"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="166" cy="248" r="8" fill="#E7A98B" opacity="0.75" />
      <circle cx="234" cy="248" r="8" fill="#E7A98B" opacity="0.75" />

      {/* Hair (crown + two braids) */}
      <path
        d="M136 232 Q136 166 200 166 Q264 166 264 232 Q242 196 200 196 Q158 196 136 232 Z"
        fill="#2E1A0F"
      />
      <path
        d="M146 214 Q136 252 147 292"
        stroke="#2E1A0F"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M254 214 Q264 252 253 292"
        stroke="#2E1A0F"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
      {/* Braid beads */}
      <circle cx="147" cy="297" r="6.5" fill="#F59E0B" />
      <circle cx="147" cy="310" r="6.5" fill="#22C55E" />
      <circle cx="253" cy="297" r="6.5" fill="#0096D6" />
      <circle cx="253" cy="310" r="6.5" fill="#EF4444" />

      {/* Open book */}
      <g>
        <path
          d="M158 336 Q200 322 242 336 L242 396 Q200 382 158 396 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="2"
        />
        <path d="M242 336 Q200 322 158 336" stroke="#94A3B8" strokeWidth="3" fill="none" />
        <line x1="200" y1="326" x2="200" y2="390" stroke="#CBD5E1" strokeWidth="3" />
        <line x1="169" y1="348" x2="192" y2="348" stroke="#CBD5E1" strokeWidth="3" />
        <line x1="169" y1="360" x2="192" y2="360" stroke="#CBD5E1" strokeWidth="3" />
        <line x1="208" y1="348" x2="231" y2="348" stroke="#CBD5E1" strokeWidth="3" />
        <line x1="208" y1="360" x2="231" y2="360" stroke="#CBD5E1" strokeWidth="3" />
      </g>

      {/* Hands */}
      <circle cx="157" cy="368" r="10" fill="#8D5524" />
      <circle cx="243" cy="368" r="10" fill="#8D5524" />
    </svg>
  );
}
