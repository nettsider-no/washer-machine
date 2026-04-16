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
          <linearGradient id="iso_front" x1="230" y1="110" x2="410" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--foreground)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Outer frame */}
        <rect x="64" y="44" width="392" height="272" rx="34" stroke="var(--hero-line)" strokeWidth="1.2" />

        {/* Alternate hero: isometric washer + minimal toolbox */}
        <g transform="translate(0 6)">
          {/* Ground plane */}
          <path
            d="M166 294 L354 294 L414 326 L226 326 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.1"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Washer: top */}
          <path
            d="M210 98 L336 98 L382 124 L256 124 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Washer: left */}
          <path
            d="M210 98 L256 124 L256 292 L210 266 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Washer: front */}
          <path
            d="M256 124 L382 124 L382 292 L256 292 Z"
            fill="url(#iso_front)"
            stroke="var(--hero-line)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Panel */}
          <path
            d="M266 140 L372 140 L372 158 L266 158 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="356" cy="149" r="6.2" fill="transparent" stroke="var(--hero-line)" strokeWidth="1.2" />
          <circle cx="334" cy="149" r="6.2" fill="transparent" stroke="var(--hero-line)" strokeWidth="1.2" />

          {/* Door */}
          <ellipse
            cx="319"
            cy="222"
            rx="56"
            ry="50"
            fill="transparent"
            stroke="var(--hero-ink)"
            strokeOpacity="0.22"
            strokeWidth="2"
          />
          <ellipse
            cx="319"
            cy="222"
            rx="40"
            ry="36"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.4"
          />

          {/* Swirl (slightly different than waves) */}
          <path
            d="M296 232c12-16 38-18 52-4 10 10 8 26-6 34-14 8-34 2-42-12"
            stroke="var(--accent)"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M306 250c7 8 18 10 26 6"
            stroke="var(--accent)"
            strokeOpacity="0.28"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Toolbox: top */}
          <path
            d="M150 210 L196 210 L216 222 L170 222 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Toolbox: front */}
          <path
            d="M170 222 L216 222 L216 256 L170 256 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Toolbox: left */}
          <path
            d="M150 210 L170 222 L170 256 L150 244 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Toolbox handle */}
          <path
            d="M176 218c0-6 5-10 12-10s12 4 12 10"
            fill="transparent"
            stroke="var(--accent)"
            strokeOpacity="0.26"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
