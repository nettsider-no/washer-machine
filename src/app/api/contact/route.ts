import { NextResponse } from "next/server";
import {
  createIpWindowLimiter,
  getClientIp,
  isOriginAllowedForSite,
} from "@/lib/requestSecurity";
import {
  escapeHtml,
  sendTelegramHtml,
} from "@/lib/telegram";
import { contactBodySchema } from "@/lib/validation/contact";

const contactLimit = createIpWindowLimiter(10 * 60_000, 20);

export async function POST(request: Request) {
  if (!isOriginAllowedForSite(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const ip = getClientIp(request);
  if (!contactLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const body = parsed.data;

  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name.trim();
  const phone = body.phone.trim();
  const email = body.email?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const message = body.message.trim();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    if (process.env.NODE_ENV === "development") {
      console.info("[api/contact] Telegram not configured — dev mock OK.");
      return NextResponse.json({ ok: true, devMock: true });
    }
    return NextResponse.json(
      { error: "Server is not configured for Telegram." },
      { status: 503 }
    );
  }

  const text = [
    "<b>New washer repair request</b>",
    "",
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Phone:</b> ${escapeHtml(phone)}`,
    email ? `<b>Email:</b> ${escapeHtml(email)}` : "",
    city ? `<b>City:</b> ${escapeHtml(city)}` : "",
    "",
    `<b>Message:</b>`,
    escapeHtml(message),
  ]
    .filter(Boolean)
    .join("\n");

  const result = await sendTelegramHtml(text);

  if (!result.ok) {
    const desc = result.json.description ?? "";
    console.error("[api/contact] Telegram API error:", result.json?.ok === false ? "request failed" : "unknown");
    if (desc.toLowerCase().includes("chat not found")) {
      console.error(
        "[api/contact] Fix TELEGRAM_CHAT_ID: open a private chat with your bot and press /start."
      );
    }
    return NextResponse.json({ error: "Failed to notify" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
