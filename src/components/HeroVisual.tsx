export function HeroVisual() {
  return (
    <div
      className="relative h-[280px] w-full max-w-lg sm:h-[360px]"
      aria-hidden
    >
      {/* Soft, theme-aware glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[color:var(--hero-glow-cyan)] via-transparent to-[color:var(--hero-glow-fuchsia)] blur-2xl" />

      {/* Premium surface */}
      <div className="absolute inset-0 rounded-3xl border border-[color:var(--hero-line)] bg-[color:var(--hero-fill)] shadow-[0_28px_90px_var(--hero-shadow)] backdrop-blur-sm" />

      {/* Minimal line illustration: washer + water + gear */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 520 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="wm_accent" x1="110" y1="70" x2="430" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent-cyan)" stopOpacity="0.28" />
            <stop offset="0.55" stopColor="var(--accent-cyan)" stopOpacity="0.05" />
            <stop offset="1" stopColor="var(--accent-fuchsia)" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Subtle grid line */}
        <path
          d="M64 82H456"
          stroke="var(--hero-line)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Washer body */}
        <rect
          x="136"
          y="80"
          width="248"
          height="240"
          rx="28"
          fill="url(#wm_accent)"
          stroke="var(--hero-line)"
          strokeWidth="1.5"
        />

        {/* Top controls */}
        <rect
          x="166"
          y="108"
          width="120"
          height="18"
          rx="9"
          fill="transparent"
          stroke="var(--hero-line)"
          strokeWidth="1.2"
        />
        <circle cx="336" cy="117" r="7" stroke="var(--hero-line)" strokeWidth="1.2" />
        <circle cx="360" cy="117" r="7" stroke="var(--hero-line)" strokeWidth="1.2" />

        {/* Door */}
        <circle
          cx="260"
          cy="208"
          r="74"
          fill="transparent"
          stroke="var(--hero-ink)"
          strokeOpacity="0.25"
          strokeWidth="2"
        />
        <circle
          cx="260"
          cy="208"
          r="56"
          fill="transparent"
          stroke="var(--hero-line)"
          strokeWidth="1.4"
        />

        {/* Water waves inside door */}
        <path
          d="M218 214c14-12 32-12 46 0s32 12 46 0"
          stroke="var(--accent-cyan)"
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M224 234c12-10 28-10 40 0s28 10 40 0"
          stroke="var(--accent-cyan)"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Droplets */}
        <path
          d="M404 138c0 10-8 18-18 18s-18-8-18-18c0-14 18-28 18-28s18 14 18 28Z"
          fill="transparent"
          stroke="var(--accent-cyan)"
          strokeOpacity="0.32"
          strokeWidth="1.8"
        />
        <path
          d="M118 246c0 8-6.5 14.5-14.5 14.5S89 254 89 246c0-11 14.5-23 14.5-23s14.5 12 14.5 23Z"
          fill="transparent"
          stroke="var(--accent-cyan)"
          strokeOpacity="0.22"
          strokeWidth="1.6"
        />

        {/* Small gear */}
        <g transform="translate(410 246)">
          <circle cx="0" cy="0" r="18" stroke="var(--hero-line)" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="6" stroke="var(--hero-line)" strokeWidth="1.4" />
          <path
            d="M0-26v8M0 18v8M-26 0h8M18 0h8M-18-18l6 6M12 12l6 6M-18 18l6-6M12-12l6-6"
            stroke="var(--hero-line)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>

        {/* Frame */}
        <rect
          x="64"
          y="44"
          width="392"
          height="272"
          rx="34"
          stroke="var(--hero-line)"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}
