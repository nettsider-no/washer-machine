import { NextResponse } from "next/server";
import { normalizeSecret } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveWebhookUrl(): string | null {
  const explicit = normalizeSecret(process.env.TELEGRAM_WEBHOOK_URL);
  if (explicit) {
    const e = explicit.replace(/\/$/, "");
    if (e.endsWith("/api/telegram")) return e;
    return `${e}/api/telegram`;
  }
  const vu = process.env.VERCEL_URL?.replace(/^https?:\/\//, "").trim();
  if (vu) return `https://${vu}/api/telegram`;
  return null;
}

/**
 * One-time setup: registers Telegram webhook with the same secret_token as TELEGRAM_WEBHOOK_SECRET.
 * GET /api/telegram/set-webhook?key=<TELEGRAM_WEBHOOK_SETUP_KEY>
 */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")?.trim();
  const setupKey = normalizeSecret(process.env.TELEGRAM_WEBHOOK_SETUP_KEY);
  if (!setupKey || key !== setupKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = normalizeSecret(process.env.TELEGRAM_BOT_TOKEN);
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN missing" }, { status: 503 });
  }

  const hookUrl = resolveWebhookUrl();
  if (!hookUrl) {
    return NextResponse.json(
      {
        error:
          "Set TELEGRAM_WEBHOOK_URL to your site origin (e.g. https://my-app.vercel.app) or deploy on Vercel so VERCEL_URL exists.",
      },
      { status: 503 }
    );
  }

  const secret = normalizeSecret(process.env.TELEGRAM_WEBHOOK_SECRET);
  const api = `https://api.telegram.org/bot${token}`;

  const getInfo = (await fetch(`${api}/getWebhookInfo`).then((r) => r.json())) as Record<
    string,
    unknown
  >;

  const body: Record<string, unknown> = { url: hookUrl };
  if (secret) body.secret_token = secret;

  const set = (await fetch(`${api}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json())) as Record<string, unknown>;

  return NextResponse.json({
    hookUrl,
    secretTokenSent: !!secret,
    note: secret
      ? "Telegram will send header x-telegram-bot-api-secret-token; it must match TELEGRAM_WEBHOOK_SECRET in Vercel."
      : "No TELEGRAM_WEBHOOK_SECRET — webhook works without secret header. Remove secret from old setWebhook via deleteWebhook if you had one.",
    getWebhookInfo: getInfo,
    setWebhook: set,
  });
}
