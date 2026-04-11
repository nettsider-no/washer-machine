import { getVisitSlotsFromDb } from "@/lib/appSettingsRepo";
import {
  formatSlotLabel,
  isSlotInFutureOslo,
  parseSlotId,
  SLOT_HOUR_END_INCLUSIVE,
  SLOT_HOUR_START,
  slotId,
  sortSlots,
  type SlotDef,
} from "@/lib/slotUtils";

export type PublicSlot = { id: string; label: string };

export async function getPublicSlots(locale: string): Promise<PublicSlot[]> {
  const raw = await getVisitSlotsFromDb();
  const seen = new Set<string>();
  const future: SlotDef[] = [];
  for (const s of raw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.d)) continue;
    if (s.h < SLOT_HOUR_START || s.h > SLOT_HOUR_END_INCLUSIVE) continue;
    if (!isSlotInFutureOslo(s)) continue;
    const id = slotId(s.d, s.h);
    if (seen.has(id)) continue;
    seen.add(id);
    future.push(s);
  }
  future.sort(sortSlots);
  return future.map((s) => ({
    id: slotId(s.d, s.h),
    label: formatSlotLabel(s, locale),
  }));
}

export async function isAllowedSlotKey(slotKey: string): Promise<boolean> {
  const parsed = parseSlotId(slotKey);
  if (!parsed || !isSlotInFutureOslo(parsed)) return false;
  const allowed = await getVisitSlotsFromDb();
  const id = slotId(parsed.d, parsed.h);
  return allowed.some((s) => slotId(s.d, s.h) === id);
}
