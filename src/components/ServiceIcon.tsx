/**
 * Service card icons — clearer Lucide pictograms.
 * Order matches `t.services` in i18n.
 */

import { Plug, Sparkles, Search, Wrench } from "lucide-react";

const box = "h-12 w-12 sm:h-14 sm:w-14";

export function ServiceIcon({ index }: { index: number }) {
  const props = { className: box, "aria-hidden": true, strokeWidth: 1.75 };

  switch (index % 4) {
    case 0:
      /* Diagnostics */
      return <Search {...props} />;
    case 1:
      /* Repair */
      return <Wrench {...props} />;
    case 2:
      /* Service / maintenance */
      return <Sparkles {...props} />;
    default:
      /* Installation / hookup */
      return <Plug {...props} />;
  }
}

export function serviceIconAccent(index: number): string {
  switch (index % 4) {
    case 0:
      return "text-[color:var(--accent-cyan)]";
    case 1:
      return "text-[color:var(--accent-fuchsia)]";
    case 2:
      return "text-[color:var(--accent-amber)]";
    default:
      return "text-emerald-400";
  }
}
