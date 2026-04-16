export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="6"
        y="4.5"
        width="20"
        height="23"
        rx="6"
        stroke="var(--hero-line)"
        strokeWidth="1.5"
      />
      <path
        d="M9 10H23"
        stroke="var(--hero-line)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="22.2" cy="7.6" r="1.2" fill="var(--hero-line)" />
      <circle cx="18.9" cy="7.6" r="1.2" fill="var(--hero-line)" />

      <circle
        cx="16"
        cy="18"
        r="6.6"
        stroke="var(--hero-line)"
        strokeWidth="1.5"
      />
      <path
        d="M12.6 19c1.4-1.7 3.6-2.2 5.3-1.2 1.7 1 3.1.8 4.1-.4"
        stroke="var(--accent)"
        strokeOpacity="0.6"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Wrench hint */}
      <path
        d="M10.8 24.6l10.5-10.5"
        stroke="var(--accent)"
        strokeOpacity="0.75"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21.4 13.8l2-2"
        stroke="var(--accent)"
        strokeOpacity="0.75"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

