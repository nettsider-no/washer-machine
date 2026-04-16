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

export async function telegramCall<T extends Record<string, unknown> = Record<string, unknown>>(
  method: string,
  body: unknown
): Promise<{
  ok: boolean;
  json: { ok?: boolean; description?: string } & T;
  status: number;
}> {
  const { token } = getTelegramEnv();
  if (!token) {
    return {
      ok: false,
      json: { description: "not configured" } as { ok?: boolean; description?: string } & T,
      status: 503,
    };
  }
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string } & T;
  return { ok: res.ok && !!json.ok, json, status: res.status };
}

export async function sendTelegramMessage(params: {
  chat_id: string | number;
  text: string;
  parse_mode?: "HTML";
  reply_markup?: unknown;
  link_preview_options?: { is_disabled?: boolean };
}): Promise<{
  ok: boolean;
  json: {
    ok?: boolean;
    description?: string;
    result?: { message_id?: number };
  } & Record<string, unknown>;
  status: number;
}> {
  return telegramCall("sendMessage", {
    chat_id: params.chat_id,
    text: params.text,
    parse_mode: params.parse_mode ?? "HTML",
    reply_markup: params.reply_markup,
    link_preview_options: params.link_preview_options ?? { is_disabled: true },
  });
}

export async function editTelegramMessageText(params: {
  chat_id: string | number;
  message_id: number;
  text: string;
  parse_mode?: "HTML";
  reply_markup?: unknown;
  link_preview_options?: { is_disabled?: boolean };
}): Promise<{
  ok: boolean;
  json: { ok?: boolean; description?: string; result?: unknown } & Record<string, unknown>;
  status: number;
}> {
  return telegramCall("editMessageText", {
    chat_id: params.chat_id,
    message_id: params.message_id,
    text: params.text,
    parse_mode: params.parse_mode ?? "HTML",
    reply_markup: params.reply_markup,
    link_preview_options: params.link_preview_options ?? { is_disabled: true },
  });
}

/** Required for inline buttons — stops the client "loading" spinner. */
export async function answerCallbackQuery(params: {
  callback_query_id: string;
  text?: string;
  show_alert?: boolean;
}): Promise<void> {
  try {
    await telegramCall("answerCallbackQuery", {
      callback_query_id: params.callback_query_id,
      ...(params.text ? { text: params.text.slice(0, 200) } : {}),
      show_alert: params.show_alert ?? false,
    });
  } catch (e) {
    console.error("[telegram] answerCallbackQuery failed", e);
  }
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
