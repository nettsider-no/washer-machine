export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Outer squircle */}
      <rect
        x="5.5"
        y="5.5"
        width="21"
        height="21"
        rx="7"
        stroke="var(--hero-line)"
        strokeWidth="1.4"
      />

      {/* Dial ring */}
      <circle
        cx="16"
        cy="16.2"
        r="7.1"
        stroke="var(--hero-line)"
        strokeWidth="1.4"
      />
      <circle
        cx="16"
        cy="16.2"
        r="4.6"
        stroke="var(--hero-line)"
        strokeOpacity="0.65"
        strokeWidth="1.2"
      />

      {/* Accent arc (service signal) */}
      <path
        d="M12.2 18.4c1.2-1.6 3.4-2.2 5.2-1.2 1.9 1 3.4.8 4.4-.4"
        stroke="var(--accent)"
        strokeOpacity="0.7"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Small notch + dot */}
      <path
        d="M16 7.9v2.1"
        stroke="var(--hero-line)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="22.9" cy="10.7" r="1.1" fill="var(--accent)" fillOpacity="0.75" />
    </svg>
  );
}

