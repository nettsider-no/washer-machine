export function HeroVisual() {
  return (
    <div
      className="relative h-[280px] w-full max-w-lg sm:h-[360px]"
      aria-hidden
    >
      {/* Premium surface */}
      <div className="absolute inset-0 rounded-3xl border border-[color:var(--hero-line)] bg-[color:var(--hero-fill)] shadow-[0_28px_90px_var(--hero-shadow)] backdrop-blur-sm" />

      {/* Isometric 3D lineart: washing machine */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 520 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="iso_face" x1="140" y1="90" x2="380" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--foreground)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Outer frame */}
        <rect x="64" y="44" width="392" height="272" rx="34" stroke="var(--hero-line)" strokeWidth="1.2" />

        {/* Isometric washer group */}
        <g transform="translate(0 2)">
          {/* Top face */}
          <path
            d="M200 92 L330 92 L388 126 L258 126 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />

          {/* Left face */}
          <path
            d="M200 92 L258 126 L258 292 L200 258 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />

          {/* Front face */}
          <path
            d="M258 126 L388 126 L388 292 L258 292 Z"
            fill="url(#iso_face)"
            stroke="var(--hero-line)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Control panel (front, top strip) */}
          <path
            d="M268 142 L378 142 L378 160 L268 160 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="362" cy="151" r="6.5" fill="transparent" stroke="var(--hero-line)" strokeWidth="1.2" />
          <circle cx="340" cy="151" r="6.5" fill="transparent" stroke="var(--hero-line)" strokeWidth="1.2" />

          {/* Door (isometric ellipse) */}
          <ellipse
            cx="323"
            cy="224"
            rx="58"
            ry="52"
            fill="transparent"
            stroke="var(--hero-ink)"
            strokeOpacity="0.22"
            strokeWidth="2"
          />
          <ellipse
            cx="323"
            cy="224"
            rx="42"
            ry="38"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.4"
          />

          {/* Water waves */}
          <path
            d="M294 230c10-9 22-9 32 0s22 9 32 0"
            stroke="var(--accent)"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M300 246c9-8 19-8 28 0s19 8 28 0"
            stroke="var(--accent)"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Accent edge highlight */}
          <path
            d="M258 126 L388 126"
            stroke="var(--accent)"
            strokeOpacity="0.22"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Small floating tool/gear (minimal) */}
          <g transform="translate(166 242)">
            <circle cx="0" cy="0" r="16" fill="transparent" stroke="var(--hero-line)" strokeWidth="1.3" />
            <path
              d="M0-22v7M0 15v7M-22 0h7M15 0h7M-15-15l5 5M10 10l5 5M-15 15l5-5M10-10l5-5"
              stroke="var(--hero-line)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
