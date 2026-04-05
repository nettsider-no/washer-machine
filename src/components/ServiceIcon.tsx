/**
 * Service card icons — simple 24×24 stroke pictograms (Lucide-style paths).
 * Order matches `t.services` in i18n.
 */

const box = "h-12 w-12 sm:h-14 sm:w-14";
const stroke = "stroke-current stroke-[1.75]";

export function ServiceIcon({ index }: { index: number }) {
  const svgProps = {
    className: box,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg" as const,
    "aria-hidden": true as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (index % 4) {
    case 0:
      /* Activity — диагностика / «пульс» проверки */
      return (
        <svg {...svgProps}>
          <path
            className={stroke}
            d="M22 12h-4l-3 9L9 3l-3 9H2"
          />
        </svg>
      );
    case 1:
      /* Wrench — ремонт */
      return (
        <svg {...svgProps}>
          <path
            className={stroke}
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          />
        </svg>
      );
    case 2:
      /* Filter — обслуживание, фильтр, профилактика */
      return (
        <svg {...svgProps}>
          <path
            className={stroke}
            d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
          />
        </svg>
      );
    default:
      /* Plug — подключение */
      return (
        <svg {...svgProps}>
          <path className={stroke} d="M12 22v-5" />
          <path className={stroke} d="M9 8V2" />
          <path className={stroke} d="M15 8V2" />
          <path
            className={stroke}
            d="M18 8v5a4 4 0 0 1-4 4 4 4 0 0 1-4-4V8z"
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
