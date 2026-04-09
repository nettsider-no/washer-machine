import { NextResponse } from "next/server";
import { addDaysYmd, compareYmd, todayYmdOslo } from "@/lib/date-oslo";
import { escapeHtml, sendTelegramHtml } from "@/lib/telegram";
import { BOOKING_SLOT_LABEL, isBookingSlot } from "@/lib/booking-slots";

type Body = {
  name?: string;
  phone?: string;
  address?: string;
  note?: string;
  date?: string;
  slot?: string;
  website?: string;
};

function isValidBookingDate(ymd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const min = todayYmdOslo();
  const max = addDaysYmd(min, 60);
  if (!max) return false;
  return compareYmd(ymd, min) >= 0 && compareYmd(ymd, max) <= 0;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const address = (body.address ?? "").trim();
  const note = (body.note ?? "").trim();
  const date = (body.date ?? "").trim();
  const slot = (body.slot ?? "").trim();

  if (!name || !phone || !date || !slot) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!isValidBookingDate(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  if (!isBookingSlot(slot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const slotLabel = BOOKING_SLOT_LABEL[slot];

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    if (process.env.NODE_ENV === "development") {
      console.info("[api/booking] Telegram not configured — dev mock OK.", {
        name,
        phone,
        address: address || undefined,
        note: note || undefined,
        date,
        slot,
      });
      return NextResponse.json({ ok: true, devMock: true });
    }
    return NextResponse.json(
      { error: "Server is not configured for Telegram." },
      { status: 503 }
    );
  }

  const text = [
    "<b>📅 New visit booking</b>",
    "",
    `<b>Date:</b> ${escapeHtml(date)}`,
    `<b>Time window:</b> ${escapeHtml(slotLabel)}`,
    "",
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Phone:</b> ${escapeHtml(phone)}`,
    address ? `<b>Address:</b> ${escapeHtml(address)}` : "",
    "",
    note ? `<b>Note:</b>\n${escapeHtml(note)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await sendTelegramHtml(text);

  if (!result.ok) {
    console.error("Telegram API error:", result.json);
    return NextResponse.json({ error: "Failed to notify" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
