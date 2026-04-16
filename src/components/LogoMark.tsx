export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Minimal washer mark (matches services icon language) */}
      <rect
        x="8"
        y="7"
        width="16"
        height="18"
        rx="5"
        stroke="var(--hero-line)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10.8 11h10.4"
        stroke="var(--hero-line)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="21" cy="9.4" r="1.05" fill="var(--accent)" fillOpacity="0.85" />

      <circle
        cx="16"
        cy="17.6"
        r="5.3"
        stroke="var(--hero-line)"
        strokeWidth="1.6"
      />
      <path
        d="M13 18.4c1.2-1.2 2.8-1.2 4 0s2.8 1.2 4 0"
        stroke="var(--accent)"
        strokeOpacity="0.72"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

