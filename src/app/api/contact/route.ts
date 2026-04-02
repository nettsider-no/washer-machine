import { NextResponse } from "next/server";

type Body = {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  message?: string;
  website?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Trim and strip accidental quotes from Vercel / .env paste. */
function normalizeSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const t = value.trim().replace(/^['"]+|['"]+$/g, "");
  return t || undefined;
}

/**
 * Telegram accepts integer or string; use string for large group ids (no JS precision loss).
 * Supports numeric id, or @channelusername for public supergroups/channels.
 */
function normalizeTelegramChatId(
  raw: string | undefined
): string | number | undefined {
  const s = normalizeSecret(raw);
  if (!s) return undefined;
  if (s.startsWith("@")) return s;
  if (/^-?\d+$/.test(s)) return s;
  return undefined;
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
  const email = (body.email ?? "").trim();
  const city = (body.city ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !phone || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const token = normalizeSecret(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = normalizeTelegramChatId(process.env.TELEGRAM_CHAT_ID);

  if (!token || !chatId) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[api/contact] Telegram not configured — dev mock OK. Payload:",
        { name, phone, email: email || undefined, city: city || undefined, message }
      );
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

  const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const tgRes = await fetch(tgUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const tgJson = (await tgRes.json()) as {
    ok?: boolean;
    description?: string;
    error_code?: number;
  };

  if (!tgRes.ok || !tgJson.ok) {
    const desc = tgJson.description ?? "";
    console.error("Telegram API error:", tgJson);
    if (desc.toLowerCase().includes("chat not found")) {
      console.error(
        "[api/contact] Fix TELEGRAM_CHAT_ID in Vercel: open a private chat with your bot and press /start, then call getUpdates and use message.chat.id (digits only, no quotes). For groups, add the bot, send a message, use that chat id (often negative)."
      );
    }
    return NextResponse.json({ error: "Failed to notify" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
