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

export type ParsedCallback =
  | { v: 1; a: "take" | "edit" | "done" | "cancel" | "edit_back"; id: string }
  | { v: 1; a: "edit_field"; id: string; f: "date" | "time" | "comment" };

export function parseCallbackData(raw: string): ParsedCallback | null {
  const t = raw.trim();
  if (!t) return null;

  // Legacy JSON (often truncated by Telegram — prefer compact on new cards)
  if (t.startsWith("{")) {
    try {
      const j = JSON.parse(t) as { v?: number; a?: string; id?: string; f?: string };
      if (j?.v !== 1 || typeof j.a !== "string" || typeof j.id !== "string") return null;
      if (j.a === "edit_field") {
        if (j.f !== "date" && j.f !== "time" && j.f !== "comment") return null;
        return { v: 1, a: "edit_field", id: j.id, f: j.f };
      }
      if (j.a === "take" || j.a === "edit" || j.a === "done" || j.a === "cancel" || j.a === "edit_back") {
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
    case "e":
      return { v: 1, a: "edit", id };
    case "d":
      return { v: 1, a: "done", id };
    case "c":
      return { v: 1, a: "cancel", id };
    case "b":
      return { v: 1, a: "edit_back", id };
    case "fd":
      return { v: 1, a: "edit_field", id, f: "date" };
    case "ft":
      return { v: 1, a: "edit_field", id, f: "time" };
    case "fc":
      return { v: 1, a: "edit_field", id, f: "comment" };
    default:
      return null;
  }
}

export function orderKeyboard(orderId: string, status: OrderStatus) {
  const rows: { text: string; callback_data: string }[][] = [
    [
      { text: "🧰 Взять в работу", callback_data: cbCompact("t", orderId) },
      { text: "✏️ Редактировать", callback_data: cbCompact("e", orderId) },
    ],
    [
      { text: "✅ Выполнено", callback_data: cbCompact("d", orderId) },
      { text: "🚫 Отменить", callback_data: cbCompact("c", orderId) },
    ],
  ];

  // Optionally you could change buttons depending on status.
  if (status !== "new") {
    // keep same for now (simple + predictable)
  }

  return { inline_keyboard: rows };
}

export function editMenuKeyboard(orderId: string) {
  return {
    inline_keyboard: [
      [
        { text: "📅 Дата", callback_data: cbCompact("fd", orderId) },
        { text: "⏰ Время", callback_data: cbCompact("ft", orderId) },
      ],
      [
        { text: "📝 Комментарий", callback_data: cbCompact("fc", orderId) },
        { text: "⬅️ Назад", callback_data: cbCompact("b", orderId) },
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

export function parseYmd(s: string): string | null {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  return t;
}

export function parseHm(s: string): string | null {
  const t = s.trim();
  if (!/^\d{2}:\d{2}$/.test(t)) return null;
  const [hh, mm] = t.split(":").map(Number);
  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;
  return t;
}

