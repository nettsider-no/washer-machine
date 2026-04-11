import { DateTime } from "luxon";

export const OSLO = "Europe/Oslo";
export const SLOT_HOUR_START = 8;
export const SLOT_HOUR_END_INCLUSIVE = 18;
export const SLOT_DAYS_AHEAD = 7;

export type SlotDef = { d: string; h: number };

/** Stable id for forms/API: `YYYY-MM-DDTHH` (hour two digits). */
export function slotId(d: string, h: number): string {
  return `${d}T${String(h).padStart(2, "0")}`;
}

export function parseSlotId(id: string): SlotDef | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2})$/.exec(id.trim());
  if (!m) return null;
  const d = m[1];
  const h = parseInt(m[2], 10);
  if (!Number.isInteger(h) || h < SLOT_HOUR_START || h > SLOT_HOUR_END_INCLUSIVE) return null;
  return { d, h };
}

export function slotDateTimeOslo(s: SlotDef): DateTime {
  const [yy, mm, dd] = s.d.split("-").map(Number);
  return DateTime.fromObject(
    { year: yy, month: mm, day: dd, hour: s.h, minute: 0, second: 0 },
    { zone: OSLO }
  );
}

export function isSlotInFutureOslo(s: SlotDef): boolean {
  return slotDateTimeOslo(s) > DateTime.now().setZone(OSLO);
}

export function sortSlots(a: SlotDef, b: SlotDef): number {
  const ta = slotDateTimeOslo(a).toMillis();
  const tb = slotDateTimeOslo(b).toMillis();
  return ta - tb;
}

/** Labels for public API (locale: no | ru | en). */
export function formatSlotLabel(s: SlotDef, locale: string): string {
  const dt = slotDateTimeOslo(s);
  const loc = locale === "no" ? "nb" : locale === "ru" ? "ru" : "en";
  return dt.setLocale(loc).toFormat("ccc d LLL yyyy, HH:mm");
}

/** Next N calendar days in Oslo (today = day 0). */
export function nextNDatesOslo(n: number): string[] {
  const out: string[] = [];
  let d = DateTime.now().setZone(OSLO).startOf("day");
  for (let i = 0; i < n; i++) {
    out.push(d.toFormat("yyyy-MM-dd"));
    d = d.plus({ days: 1 });
  }
  return out;
}

export function hourRange(): number[] {
  const r: number[] = [];
  for (let h = SLOT_HOUR_START; h <= SLOT_HOUR_END_INCLUSIVE; h++) r.push(h);
  return r;
}
