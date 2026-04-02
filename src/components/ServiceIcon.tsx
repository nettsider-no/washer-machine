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
          <rect
            x="10"
            y="12"
            width="22"
            height="28"
            rx="3"
            className="stroke-current"
            strokeWidth="1.75"
          />
          <circle
            cx="21"
            cy="26"
            r="7"
            className="stroke-current"
            strokeWidth="1.75"
          />
          <circle
            cx="34"
            cy="17"
            r="5.5"
            className="stroke-current"
            strokeWidth="1.75"
          />
          <path
            d="M37 20l3 3M31 14l3 3"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M14 40h14"
            className="stroke-current"
            strokeWidth="1.75"
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
          <path
            d="M30 6L42 18l-4 4-6-6-4 4 10 10-4 4-10-10-8 8c-4 4-10 4-14 0s-4-10 0-14l8-8-6-6 4-4 6 6 4-4-6-6 4-4z"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle
            cx="17"
            cy="31"
            r="4.5"
            className="stroke-current"
            strokeWidth="1.75"
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
          <path
            d="M16 8h16l-2 10H18L16 8z"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M20 18v6c0 4 2 6 4 8M28 18v6c0 4-2 6-4 8"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M24 32v6"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M18 40h12"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M32 12l6-4M35 15l6-4"
            className="stroke-current"
            strokeWidth="1.5"
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
          <path
            d="M8 20h10v14H8V20zM30 16h10v18H30V16z"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M18 26h12"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M24 26v8"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M20 38h8"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M14 12c2-2 5-3 10-3s8 1 10 3"
            className="stroke-current"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="10" r="2" className="fill-current opacity-80" />
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
