/** Inline SVGs for the four service cards (order matches `t.services` in i18n). */

const box = "h-12 w-12 sm:h-14 sm:w-14";

export function ServiceIcon({ index }: { index: number }) {
  switch (index % 4) {
    case 0:
      return (
        <svg
          className={box}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Washer body + door */}
          <rect
            x="14"
            y="18"
            width="20"
            height="22"
            rx="7"
            className="stroke-current"
            strokeWidth="1.8"
          />
          <circle
            cx="24"
            cy="29"
            r="7"
            className="stroke-current"
            strokeWidth="1.8"
          />
          {/* Magnifier */}
          <circle
            cx="35"
            cy="13"
            r="5"
            className="stroke-current"
            strokeWidth="1.8"
          />
          <path
            d="M38 16l8 8"
            className="stroke-current"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 1:
      return (
        <svg
          className={box}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Nut */}
          <polygon
            points="24,12 34,18 34,30 24,36 14,30 14,18"
            className="stroke-current"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Wrench (simplified) */}
          <path
            d="M18 34l14-14 4 4-14 14h-4v-4z"
            className="stroke-current"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M30 14l4 4"
            className="stroke-current"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 2:
      return (
        <svg
          className={box}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Filter funnel + simple maintenance vibe */}
          <path
            d="M16 14h16l-6 10v14l-4-2V24l-6-10z"
            className="stroke-current"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M20 40h8"
            className="stroke-current"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M24 20l2 4"
            className="stroke-current"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg
          className={box}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Water droplet */}
          <path
            d="M24 12c3 4 8 10 8 15a8 8 0 1 1-16 0c0-5 5-11 8-15z"
            className="stroke-current"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Plug / connection */}
          <rect
            x="16"
            y="26"
            width="16"
            height="16"
            rx="3"
            className="stroke-current"
            strokeWidth="1.8"
          />
          <path
            d="M22 26v-7M26 26v-7"
            className="stroke-current"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function serviceIconAccent(index: number): string {
  switch (index % 4) {
    case 0:
      return "text-cyan-400";
    case 1:
      return "text-fuchsia-400";
    case 2:
      return "text-amber-300";
    default:
      return "text-emerald-400";
  }
}
