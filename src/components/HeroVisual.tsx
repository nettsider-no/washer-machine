export function HeroVisual() {
  return (
    <div
      className="relative h-[280px] w-full max-w-lg sm:h-[360px]"
      aria-hidden
    >
      {/* Premium surface */}
      <div className="absolute inset-0 rounded-3xl border border-[color:var(--hero-line)] bg-[color:var(--hero-fill)] shadow-[0_28px_90px_var(--hero-shadow)] backdrop-blur-sm" />

      {/* Isometric 3D lineart hero (door + tools) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 520 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="isoFront" x1="220" y1="78" x2="420" y2="312" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" stopOpacity="0.12" />
            <stop offset="1" stopColor="var(--foreground)" stopOpacity="0.02" />
          </linearGradient>
          <radialGradient id="shadow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(308 304) rotate(90) scale(34 128)">
            <stop stopColor="var(--foreground)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--foreground)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer frame */}
        <rect x="64" y="44" width="392" height="272" rx="34" stroke="var(--hero-line)" strokeWidth="1.2" />

        {/* Ground shadow */}
        <ellipse cx="308" cy="304" rx="132" ry="34" fill="url(#shadow)" />

        <g transform="translate(0 2)">
          {/* Main washer block (isometric) */}
          <path
            d="M222 88 L336 88 L392 122 L278 122 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path
            d="M222 88 L278 122 L278 292 L222 260 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path
            d="M278 122 L392 122 L392 292 L278 292 Z"
            fill="url(#isoFront)"
            stroke="var(--hero-line)"
            strokeWidth="1.45"
            strokeLinejoin="round"
          />

          {/* Control panel */}
          <path
            d="M288 140 L382 140 L382 158 L288 158 Z"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.15"
            strokeLinejoin="round"
          />
          <circle cx="366" cy="149" r="6.2" fill="transparent" stroke="var(--hero-line)" strokeWidth="1.15" />
          <circle cx="344" cy="149" r="6.2" fill="transparent" stroke="var(--hero-line)" strokeWidth="1.15" />

          {/* Door ring */}
          <ellipse
            cx="336"
            cy="222"
            rx="54"
            ry="48"
            fill="transparent"
            stroke="var(--hero-ink)"
            strokeOpacity="0.22"
            strokeWidth="2"
          />
          <ellipse
            cx="336"
            cy="222"
            rx="38"
            ry="34"
            fill="transparent"
            stroke="var(--hero-line)"
            strokeWidth="1.35"
          />

          {/* Door opened (separate) */}
          <g transform="translate(0 0)" opacity="0.98">
            <path
              d="M156 152 L236 152 L266 172 L186 172 Z"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M186 172 L266 172 L266 254 L186 254 Z"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M156 152 L186 172 L186 254 L156 234 Z"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <ellipse
              cx="226"
              cy="214"
              rx="28"
              ry="24"
              fill="transparent"
              stroke="var(--accent)"
              strokeOpacity="0.28"
              strokeWidth="2"
            />
            <ellipse
              cx="226"
              cy="214"
              rx="18"
              ry="16"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.2"
            />
          </g>

          {/* Subtle water swirl inside main door */}
          <path
            d="M312 232c10-14 34-16 46-4 9 9 7 23-5 30-12 7-30 2-38-10"
            stroke="var(--accent)"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M320 248c6 7 16 9 23 6"
            stroke="var(--accent)"
            strokeOpacity="0.26"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Floating small tools */}
          <g stroke="var(--hero-line)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
            <path d="M410 170l18-10" />
            <path d="M404 176l18-10" />
            <path d="M180 118l16 8" />
            <path d="M176 126l16 8" />
          </g>
          <g stroke="var(--hero-line)" strokeWidth="1.25" opacity="0.85">
            <circle cx="416" cy="236" r="10" fill="transparent" />
            <path d="M416 222v6M416 244v6M402 236h6M424 236h6" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
