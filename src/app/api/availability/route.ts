import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { getPublicSlots } from "@/lib/publicAvailability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locRaw = searchParams.get("locale") ?? "no";
  const locale = isLocale(locRaw) ? locRaw : "no";
  try {
    const slots = await getPublicSlots(locale);
    return NextResponse.json({ ok: true, slots, timezone: "Europe/Oslo" });
  } catch (e) {
    console.error("[api/availability]", e);
    return NextResponse.json(
      { ok: false, error: "availability_unavailable", slots: [] },
      { status: 503 }
    );
  }
}
