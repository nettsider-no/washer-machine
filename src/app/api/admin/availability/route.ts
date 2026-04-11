import { NextResponse } from "next/server";
import { readAdminCookie } from "@/lib/adminAuth";
import { getTakenVisitSlotKeys } from "@/lib/orderRepo";
import { getVisitSlotsFromDb, setVisitSlotsInDb } from "@/lib/appSettingsRepo";
import {
  nextNDatesOslo,
  SLOT_DAYS_AHEAD,
  SLOT_HOUR_END_INCLUSIVE,
  SLOT_HOUR_START,
  slotId,
  type SlotDef,
} from "@/lib/slotUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeIncoming(slots: unknown): SlotDef[] | null {
  if (!Array.isArray(slots)) return null;
  const allowedDates = new Set(nextNDatesOslo(SLOT_DAYS_AHEAD));
  const out: SlotDef[] = [];
  const seen = new Set<string>();
  for (const item of slots) {
    if (!item || typeof item !== "object") continue;
    const d = (item as { d?: unknown }).d;
    const h = (item as { h?: unknown }).h;
    if (typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    if (!allowedDates.has(d)) continue;
    const hour = Number(h);
    if (
      !Number.isInteger(hour) ||
      hour < SLOT_HOUR_START ||
      hour > SLOT_HOUR_END_INCLUSIVE
    ) {
      continue;
    }
    const id = slotId(d, hour);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ d, h: hour });
  }
  return out;
}

export async function GET(request: Request) {
  if (!readAdminCookie(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const [slots, booked] = await Promise.all([
      getVisitSlotsFromDb(),
      getTakenVisitSlotKeys(),
    ]);
    return NextResponse.json({
      ok: true,
      slots,
      bookedSlotIds: Array.from(booked),
    });
  } catch (e) {
    console.error("[api/admin/availability GET]", e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!readAdminCookie(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { slots?: unknown };
  try {
    body = (await request.json()) as { slots?: unknown };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const normalized = normalizeIncoming(body.slots);
  if (normalized === null) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  try {
    await setVisitSlotsInDb(normalized);
    return NextResponse.json({ ok: true, slots: normalized });
  } catch (e) {
    console.error("[api/admin/availability POST]", e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
