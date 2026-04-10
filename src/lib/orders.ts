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

export function cbData(data: { v: 1; a: string; id: string; f?: string }) {
  // Must stay <= 64 bytes. UUID makes it tight but still ok.
  return JSON.stringify(data);
}

export function orderKeyboard(orderId: string, status: OrderStatus) {
  const rows: { text: string; callback_data: string }[][] = [
    [
      { text: "🧰 Взять в работу", callback_data: cbData({ v: 1, a: "take", id: orderId }) },
      { text: "✏️ Редактировать", callback_data: cbData({ v: 1, a: "edit", id: orderId }) },
    ],
    [
      { text: "✅ Выполнено", callback_data: cbData({ v: 1, a: "done", id: orderId }) },
      { text: "🚫 Отменить", callback_data: cbData({ v: 1, a: "cancel", id: orderId }) },
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
        { text: "📅 Дата", callback_data: cbData({ v: 1, a: "edit_field", id: orderId, f: "date" }) },
        { text: "⏰ Время", callback_data: cbData({ v: 1, a: "edit_field", id: orderId, f: "time" }) },
      ],
      [
        { text: "📝 Комментарий", callback_data: cbData({ v: 1, a: "edit_field", id: orderId, f: "comment" }) },
        { text: "⬅️ Назад", callback_data: cbData({ v: 1, a: "edit_back", id: orderId }) },
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

