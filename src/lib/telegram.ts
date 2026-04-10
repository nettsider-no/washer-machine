/** Shared helpers for Telegram Bot API (sendMessage). */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function normalizeSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const t = value.trim().replace(/^['"]+|['"]+$/g, "");
  return t || undefined;
}

export function normalizeTelegramChatId(
  raw: string | undefined
): string | number | undefined {
  const s = normalizeSecret(raw);
  if (!s) return undefined;
  if (s.startsWith("@")) return s;
  if (/^-?\d+$/.test(s)) return s;
  return undefined;
}

export function getTelegramEnv(): {
  token: string | undefined;
  chatId: string | number | undefined;
} {
  return {
    token: normalizeSecret(process.env.TELEGRAM_BOT_TOKEN),
    chatId: normalizeTelegramChatId(process.env.TELEGRAM_CHAT_ID),
  };
}

export async function sendTelegramHtml(html: string): Promise<{
  ok: boolean;
  json: { ok?: boolean; description?: string };
  status: number;
}> {
  const { token, chatId } = getTelegramEnv();
  if (!token || !chatId) {
    return { ok: false, json: { description: "not configured" }, status: 503 };
  }
  const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const tgRes = await fetch(tgUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: html,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  const json = (await tgRes.json()) as { ok?: boolean; description?: string };
  return { ok: tgRes.ok && !!json.ok, json, status: tgRes.status };
}

export type TelegramMediaKind = "photo" | "video";

export async function sendTelegramMediaGroup(params: {
  media: { kind: TelegramMediaKind; file: File; filename?: string }[];
}): Promise<{
  ok: boolean;
  json: { ok?: boolean; description?: string };
  status: number;
}> {
  const { token, chatId } = getTelegramEnv();
  if (!token || !chatId) {
    return { ok: false, json: { description: "not configured" }, status: 503 };
  }
  if (params.media.length === 0) {
    return { ok: true, json: { ok: true }, status: 200 };
  }

  const tgUrl = `https://api.telegram.org/bot${token}/sendMediaGroup`;
  const fd = new FormData();
  fd.set("chat_id", String(chatId));

  const mediaJson = params.media.map((m, i) => {
    const attachName = `file${i + 1}`;
    fd.append(attachName, m.file, m.filename || m.file.name || attachName);
    return { type: m.kind, media: `attach://${attachName}` };
  });
  fd.set("media", JSON.stringify(mediaJson));

  const tgRes = await fetch(tgUrl, { method: "POST", body: fd });
  const json = (await tgRes.json()) as { ok?: boolean; description?: string };
  return { ok: tgRes.ok && !!json.ok, json, status: tgRes.status };
}
