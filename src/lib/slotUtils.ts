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

/**
 * Собрать id слота из полей БД (text/date/time как отдаёт node-pg).
 * Без этого даты-Date или нестандартные строки терялись, и «занято» в админке не совпадало с сайтом.
 */
export function visitFieldsToSlotKey(
  visit_date: unknown,
  visit_time: unknown
): string | null {
  const d = normalizeVisitDateLoose(visit_date);
  if (!d) return null;
  const hh = hourFromVisitTimeLoose(visit_time);
  if (hh == null || !Number.isFinite(hh)) return null;
  const id = slotId(d, hh);
  return parseSlotId(id) ? id : null;
}

function normalizeVisitDateLoose(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") {
    const t = v.trim();
    const m = /^(\d{4}-\d{2}-\d{2})/.exec(t);
    return m ? m[1] : null;
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return `${v.getUTCFullYear()}-${String(v.getUTCMonth() + 1).padStart(2, "0")}-${String(v.getUTCDate()).padStart(2, "0")}`;
  }
  return null;
}

function hourFromVisitTimeLoose(v: unknown): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  let m = /^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?(?:\.\d+)?$/.exec(s);
  if (m) return parseInt(m[1], 10);
  m = /[T\s](\d{1,2}):(\d{2})/.exec(s);
  if (m) return parseInt(m[1], 10);
  return null;
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
