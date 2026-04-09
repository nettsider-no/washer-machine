import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { escapeHtml, sendTelegramHtml } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * Cal.com → Telegram. Configure in Cal: Settings → Developer → Webhooks
 * Subscriber URL: https://YOUR_DOMAIN/api/webhooks/cal
 * Events: Booking Created, (optional) Cancelled, Rescheduled
 * Secret: same value as CAL_WEBHOOK_SECRET in env (recommended).
 */

function verifyCalSignature(
  rawBody: string,
  secret: string,
  header: string | null
): boolean {
  if (!header || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const sig = header.replace(/^sha256=/i, "").trim();
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(sig, "utf8"));
  } catch {
    return false;
  }
}

type Attendee = { name?: string; email?: string };

function extractPayload(body: Record<string, unknown>): {
  trigger: string;
  title: string;
  start: string;
  end: string;
  guest: string;
  email: string;
  notes: string;
  uid: string;
} {
  const trigger = String(body.triggerEvent ?? "UNKNOWN");
  const pl = (body.payload ?? body) as Record<string, unknown>;
  const attendees = (pl.attendees as Attendee[] | undefined) ?? [];
  const a0 = attendees[0];
  return {
    trigger,
    title: String(pl.title ?? "—"),
    start: String(pl.startTime ?? "—"),
    end: String(pl.endTime ?? "—"),
    guest: String(a0?.name ?? a0?.email ?? "—"),
    email: String(a0?.email ?? "—"),
    notes: String(pl.additionalNotes ?? ""),
    uid: String(pl.uid ?? "—"),
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.CAL_WEBHOOK_SECRET?.trim();

  if (secret) {
    const sig = request.headers.get("x-cal-signature-256");
    if (!verifyCalSignature(rawBody, secret, sig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    console.warn(
      "[api/webhooks/cal] CAL_WEBHOOK_SECRET is not set — refusing webhook in production"
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { trigger, title, start, end, guest, email, notes, uid } =
    extractPayload(body);

  const emoji =
    trigger === "BOOKING_CREATED"
      ? "📅"
      : trigger === "BOOKING_CANCELLED"
        ? "🚫"
        : trigger === "BOOKING_RESCHEDULED"
          ? "🔄"
          : "📋";

  const lines = [
    `<b>${emoji} Cal.com: ${escapeHtml(trigger)}</b>`,
    "",
    `<b>Event:</b> ${escapeHtml(title)}`,
    `<b>Start:</b> ${escapeHtml(start)}`,
    `<b>End:</b> ${escapeHtml(end)}`,
    `<b>Guest:</b> ${escapeHtml(guest)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>UID:</b> ${escapeHtml(uid)}`,
  ];
  if (notes) {
    lines.push("", `<b>Notes:</b>`, escapeHtml(notes));
  }

  const html = lines.join("\n");

  const result = await sendTelegramHtml(html);
  if (!result.ok) {
    if (result.status === 503) {
      return NextResponse.json(
        { error: "Telegram not configured" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Telegram send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
