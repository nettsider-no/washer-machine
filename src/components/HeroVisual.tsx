export function HeroVisual() {
  return (
    <div
      className="relative h-[280px] w-full max-w-lg sm:h-[360px]"
      aria-hidden
    >
      {/* Premium surface */}
      <div className="absolute inset-0 rounded-3xl border border-[color:var(--hero-line)] bg-[color:var(--hero-fill)] shadow-[0_28px_90px_var(--hero-shadow)] backdrop-blur-sm" />

      {/* Isometric 3D lineart hero */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 520 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id="isoFace"
            x1="208"
            y1="86"
            x2="402"
            y2="296"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--accent)" stopOpacity="0.12" />
            <stop offset="1" stopColor="var(--foreground)" stopOpacity="0.02" />
          </linearGradient>
          <radialGradient
            id="baseShadow"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(306 302) rotate(90) scale(34 140)"
          >
            <stop stopColor="var(--foreground)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--foreground)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer frame */}
        <rect x="64" y="44" width="392" height="272" rx="34" stroke="var(--hero-line)" strokeWidth="1.2" />

        {/* Ambient wave lines */}
        <g stroke="var(--hero-line)" strokeWidth="1.2" strokeLinecap="round" opacity="0.55">
          <path d="M98 106c18-10 36-10 54 0s36 10 54 0" />
          <path d="M110 250c16-9 32-9 48 0s32 9 48 0" />
          <path d="M332 92c18-10 36-10 54 0s36 10 54 0" />
          <path d="M338 262c14-8 28-8 42 0s28 8 42 0" />
        </g>

        {/* Ground shadow */}
        <ellipse cx="306" cy="302" rx="140" ry="34" fill="url(#baseShadow)" />

        <g transform="translate(0 4)">
          {/* Washer body */}
          <g strokeLinejoin="round" strokeLinecap="round">
            <path
              d="M214 92 L334 92 L394 128 L274 128 Z"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.3"
            />
            <path
              d="M214 92 L274 128 L274 292 L214 258 Z"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.3"
            />
            <path
              d="M274 128 L394 128 L394 292 L274 292 Z"
              fill="url(#isoFace)"
              stroke="var(--hero-line)"
              strokeWidth="1.55"
            />
          </g>

          {/* Panel */}
          <g stroke="var(--hero-line)" strokeWidth="1.2" strokeLinejoin="round">
            <path d="M286 146 L382 146 L382 164 L286 164 Z" />
            <circle cx="366" cy="155" r="6.1" fill="transparent" />
            <circle cx="344" cy="155" r="6.1" fill="transparent" />
          </g>

          {/* Door */}
          <g>
            <ellipse
              cx="334"
              cy="224"
              rx="55"
              ry="49"
              fill="transparent"
              stroke="var(--hero-ink)"
              strokeOpacity="0.22"
              strokeWidth="2"
            />
            <ellipse
              cx="334"
              cy="224"
              rx="39"
              ry="35"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.35"
            />
            <path
              d="M312 236c10-14 34-16 46-4 9 9 7 23-5 30-12 7-30 2-38-10"
              stroke="var(--accent)"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M320 252c6 7 16 9 23 6"
              stroke="var(--accent)"
              strokeOpacity="0.24"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Separate door (floating/open) */}
          <g opacity="0.98" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M144 156 L236 156 L270 178 L178 178 Z"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.2"
            />
            <path
              d="M178 178 L270 178 L270 266 L178 266 Z"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.2"
            />
            <path
              d="M144 156 L178 178 L178 266 L144 244 Z"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.2"
            />
            <ellipse
              cx="230"
              cy="222"
              rx="30"
              ry="26"
              fill="transparent"
              stroke="var(--accent)"
              strokeOpacity="0.24"
              strokeWidth="2"
            />
            <ellipse
              cx="230"
              cy="222"
              rx="19"
              ry="16.5"
              fill="transparent"
              stroke="var(--hero-line)"
              strokeWidth="1.2"
            />
          </g>

          {/* Tool marks */}
          <g stroke="var(--hero-line)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
            <path d="M414 170l18-10" />
            <path d="M408 178l18-10" />
            <path d="M178 118l16 8" />
            <path d="M174 126l16 8" />
          </g>
          <g stroke="var(--hero-line)" strokeWidth="1.25" opacity="0.85">
            <circle cx="416" cy="238" r="10" fill="transparent" />
            <path d="M416 224v6M416 246v6M402 238h6M424 238h6" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
