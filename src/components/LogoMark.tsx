export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Hex badge (distinct silhouette) */}
      <path
        d="M16 4.8 26.2 10.7V21.3L16 27.2 5.8 21.3V10.7L16 4.8Z"
        fill="transparent"
        stroke="var(--hero-line)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Washer door ring */}
      <circle
        cx="14.7"
        cy="16.2"
        r="6.2"
        stroke="var(--hero-line)"
        strokeWidth="1.4"
      />
      <circle
        cx="14.7"
        cy="16.2"
        r="3.9"
        stroke="var(--hero-line)"
        strokeOpacity="0.6"
        strokeWidth="1.2"
      />

      {/* Accent wave */}
      <path
        d="M10.6 17.2c1.3-1.2 3-1.2 4.3 0s3 1.2 4.3 0"
        stroke="var(--accent)"
        strokeOpacity="0.75"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Minimal tool mark (wrench-like) */}
      <path
        d="M19.2 12.3l4.2 4.2"
        stroke="var(--accent)"
        strokeOpacity="0.8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M23.8 17.3c.7-.7.7-1.8 0-2.5-.7-.7-1.8-.7-2.5 0"
        stroke="var(--accent)"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

