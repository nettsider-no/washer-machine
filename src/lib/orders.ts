import { escapeHtml } from "@/lib/telegram";

export type OrderStatus = "new" | "in_progress" | "done" | "cancelled";

export type OrderRow = {
  id: string;
  created_at: string;
  updated_at: string;

  status: OrderStatus;
  locale: string | null;

  name: string;
  phone: string;
  address: string | null;
  brand: string | null;
  model: string | null;
  issue: string;
  error_code: string | null;

  preferred_window: "today" | "tomorrow" | "soon" | null;
  preferred_comment: string | null;

  visit_date: string | null; // YYYY-MM-DD
  visit_time: string | null; // HH:MM
  visit_comment: string | null;

  tg_chat_id: string | null;
  tg_message_id: number | null;
};

/**
 * Telegram callback_data max 64 bytes. JSON + full UUID overflows — use compact form:
 * `1|t|<uuid>` (~42 bytes). Delimiter | is not in UUIDs.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function cbCompact(action: string, orderId: string): string {
  return `1|${action}|${orderId}`;
}

export type ParsedCallback = {
  v: 1;
  a: "take" | "done" | "cancel";
  id: string;
};

export function parseCallbackData(raw: string): ParsedCallback | null {
  const t = raw.trim();
  if (!t) return null;

  if (t.startsWith("{")) {
    try {
      const j = JSON.parse(t) as { v?: number; a?: string; id?: string };
      if (j?.v !== 1 || typeof j.id !== "string") return null;
      if (j.a === "take" || j.a === "done" || j.a === "cancel") {
        return { v: 1, a: j.a, id: j.id };
      }
      return null;
    } catch {
      return null;
    }
  }

  const parts = t.split("|");
  if (parts.length !== 3 || parts[0] !== "1") return null;
  const [, code, id] = parts;
  if (!UUID_RE.test(id)) return null;

  switch (code) {
    case "t":
      return { v: 1, a: "take", id };
    case "d":
      return { v: 1, a: "done", id };
    case "c":
      return { v: 1, a: "cancel", id };
    default:
      return null;
  }
}

/**
 * Старые карточки имели кнопки «Редактировать» и др. — Telegram не меняет клавиатуру сам.
 * Если пришёл callback вида 1|<любой код кроме t/d/c>|<uuid>, возвращаем id заявки,
 * чтобы вебхук мог вызвать editMessageText и обновить кнопки.
 */
export function parseStaleCardOrderId(raw: string): string | null {
  const t = raw.trim();
  if (t.startsWith("{")) {
    try {
      const j = JSON.parse(t) as { v?: number; a?: string; id?: string };
      if (j?.v !== 1 || typeof j.id !== "string" || !UUID_RE.test(j.id)) return null;
      if (j.a === "take" || j.a === "done" || j.a === "cancel") return null;
      if (typeof j.a === "string" && j.a.length) return j.id;
    } catch {
      return null;
    }
    return null;
  }
  const parts = t.split("|");
  if (parts.length !== 3 || parts[0] !== "1") return null;
  const id = parts[2] ?? "";
  if (!UUID_RE.test(id)) return null;
  const code = parts[1] ?? "";
  if (code === "t" || code === "d" || code === "c") return null;
  if (!/^[a-z]{1,2}$/.test(code)) return null;
  return id;
}

export function orderKeyboard(orderId: string, _status: OrderStatus) {
  return {
    inline_keyboard: [
      [{ text: "🧰 Взять в работу", callback_data: cbCompact("t", orderId) }],
      [
        { text: "✅ Выполнено", callback_data: cbCompact("d", orderId) },
        { text: "🚫 Отменить", callback_data: cbCompact("c", orderId) },
      ],
    ],
  };
}

function statusLabel(status: OrderStatus) {
  if (status === "new") return "🆕 <b>Новая</b>";
  if (status === "in_progress") return "🔧 <b>В работе</b>";
  if (status === "done") return "✅ <b>Выполнено</b>";
  return "🚫 <b>Отменено</b>";
}

function preferredLabel(v: OrderRow["preferred_window"]) {
  if (v === "today") return "Сегодня";
  if (v === "tomorrow") return "Завтра";
  if (v === "soon") return "В ближайшие дни";
  return "не указано";
}

/** Текст для Telegram: пустое поле заявки → «не указано». */
function disp(raw: string | null | undefined): string {
  const t = typeof raw === "string" ? raw.trim() : "";
  return t ? escapeHtml(t) : "не указано";
}

export function formatOrderHtml(o: OrderRow): string {
  const parts: string[] = [];

  parts.push(`🛠️ <b>Заявка</b>  ${statusLabel(o.status)}`);
  parts.push("━━━━━━━━━━━━━━━━━━━━");

  parts.push(`👤 <b>Клиент:</b> ${disp(o.name)}`);
  parts.push(`📞 <b>Телефон:</b> ${disp(o.phone)}`);
  parts.push(`📍 <b>Адрес:</b> ${disp(o.address)}`);
  parts.push(`🧺 <b>Марка:</b> ${disp(o.brand)}`);
  parts.push(`🔎 <b>Модель:</b> ${disp(o.model)}`);
  parts.push(`⚠️ <b>Код ошибки:</b> ${disp(o.error_code)}`);

  parts.push("━━━━━━━━━━━━━━━━━━━━");
  parts.push(`🧰 <b>Проблема:</b>\n${disp(o.issue)}`);

  parts.push("━━━━━━━━━━━━━━━━━━━━");
  const hasSlot = Boolean(o.visit_date?.trim() && o.visit_time?.trim());
  if (hasSlot) {
    parts.push(
      `🗓️ <b>Слот (Europe/Oslo):</b> ${escapeHtml(o.visit_date!)} ${escapeHtml(o.visit_time!)}`
    );
  } else if (o.preferred_window) {
    parts.push(`🕒 <b>Когда удобно:</b> ${escapeHtml(preferredLabel(o.preferred_window))}`);
  } else {
    parts.push(`🕒 <b>Когда удобно:</b> не указано`);
  }
  if (o.preferred_comment?.trim()) {
    parts.push(`📝 <b>Комментарий к времени:</b> ${escapeHtml(o.preferred_comment.trim())}`);
  }
  if (o.visit_comment?.trim()) {
    parts.push(`🗒️ <b>Детали мастера:</b> ${escapeHtml(o.visit_comment.trim())}`);
  }

  parts.push("");
  parts.push(`🆔 <code>${escapeHtml(o.id)}</code>`);

  return parts.join("\n");
}
