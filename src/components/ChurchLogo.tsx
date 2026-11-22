interface ChurchLogoProps {
  className?: string;
}

export function ChurchLogo({className = 'w-10 h-10'}: ChurchLogoProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Cross silhouette on left */}
      <path
        d="M23 12C28 11 33 13 36 16L37 37L51 37C52 40 52 44 50 47L38 48L41 103C36 106 28 106 24 103L22 51L10 53C7 48 6 41 9 36L22 36L21 15C21 13 22 12 23 12Z"
        fill="#1C1917"
      />
      {/* Two upper praising figures */}
      <circle cx="58" cy="40" r="6" fill="#1C1917" />
      <circle cx="74" cy="41" r="6" fill="#1C1917" />
      <path
        d="M44 43C51 47 61 48 66 47C76 50 88 44 97 34C95 40 87 50 76 55L74 88L65 92L58 59C51 54 45 48 44 43Z"
        fill="#1C1917"
      />
      {/* Left child figure */}
      <circle cx="54" cy="61" r="4.5" fill="#1C1917" />
      <path
        d="M39 58C45 62 52 66 56 67L62 84L55 87L49 71C44 68 40 63 39 58Z"
        fill="#1C1917"
      />
      {/* Right child figure */}
      <circle cx="79" cy="65" r="4" fill="#1C1917" />
      <path
        d="M72 72C79 71 89 67 100 60C95 66 86 73 79 76L75 88L69 86L72 72Z"
        fill="#1C1917"
      />
      {/* White 'N' overlapping the cross base */}
      <path
        d="M22 96L24 77L34 95L38 77"
        stroke="#FBF9F5"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 'G Wes' brush typography */}
      <text
        x="43"
        y="108"
        fill="#1C1917"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="24"
        letterSpacing="-0.5"
      >
        G Wes
      </text>
    </svg>
  );
}
