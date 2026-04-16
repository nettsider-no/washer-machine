/**
 * Service card icons.
 * Order matches `t.services` in i18n.
 */

import {
  GearIcon,
  LightningBoltIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

const box = "h-12 w-12 sm:h-14 sm:w-14";

export function ServiceIcon({ index }: { index: number }) {
  const props = { className: box, "aria-hidden": true };

  switch (index % 4) {
    case 0:
      /* Diagnostics */
      return <MagnifyingGlassIcon {...props} />;
    case 1:
      /* Repair */
      return <GearIcon {...props} />;
    case 2:
      /* Service / maintenance */
      return <MagicWandIcon {...props} />;
    default:
      /* Installation / hookup */
      return <LightningBoltIcon {...props} />;
  }
}

export function serviceIconAccent(index: number): string {
  void index;
  return "text-[color:var(--accent)]";
}
