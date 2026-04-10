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

export function orderKeyboard(orderId: string, _status: OrderStatus) {
  return {
    inline_keyboard: [
      [
        { text: "🧰 Взять в работу", callback_data: cbCompact("t", orderId) },
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
  return "—";
}

export function formatOrderHtml(o: OrderRow): string {
  const parts: string[] = [];

  parts.push(`🛠️ <b>Заявка</b>  ${statusLabel(o.status)}`);
  parts.push("━━━━━━━━━━━━━━━━━━━━");

  parts.push(`👤 <b>Клиент:</b> ${escapeHtml(o.name)}`);
  parts.push(`📞 <b>Телефон:</b> ${escapeHtml(o.phone)}`);
  parts.push(`📍 <b>Адрес:</b> ${o.address ? escapeHtml(o.address) : "—"}`);
  parts.push(`🧺 <b>Марка:</b> ${o.brand ? escapeHtml(o.brand) : "—"}`);
  parts.push(`🔎 <b>Модель:</b> ${o.model ? escapeHtml(o.model) : "—"}`);
  if (o.error_code) parts.push(`⚠️ <b>Код ошибки:</b> ${escapeHtml(o.error_code)}`);

  parts.push("━━━━━━━━━━━━━━━━━━━━");
  parts.push(`🧰 <b>Проблема:</b>\n${escapeHtml(o.issue)}`);

  parts.push("━━━━━━━━━━━━━━━━━━━━");
  parts.push(
    `🗓️ <b>Выезд:</b> ${o.visit_date ? escapeHtml(o.visit_date) : "—"}  ⏰ ${
      o.visit_time ? escapeHtml(o.visit_time) : "—"
    }`
  );
  parts.push(`🕒 <b>Удобно:</b> ${escapeHtml(preferredLabel(o.preferred_window))}`);
  if (o.preferred_comment) parts.push(`📝 <b>Комментарий:</b> ${escapeHtml(o.preferred_comment)}`);
  if (o.visit_comment) parts.push(`🗒️ <b>Детали мастера:</b> ${escapeHtml(o.visit_comment)}`);

  parts.push("");
  parts.push(`🆔 <code>${escapeHtml(o.id)}</code>`);

  return parts.join("\n");
}
