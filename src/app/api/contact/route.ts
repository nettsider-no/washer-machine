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

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: "Server is not configured for Telegram." },
      { status: 503 }
    );
  }

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

  const tgJson = (await tgRes.json()) as { ok?: boolean; description?: string };

  if (!tgRes.ok || !tgJson.ok) {
    console.error("Telegram API error:", tgJson);
    return NextResponse.json({ error: "Failed to notify" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
