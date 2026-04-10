import { NextResponse } from "next/server";
import {
  deleteTgSession,
  getTgSession,
  listActiveOrders,
  loadOrderById,
  patchOrder,
  upsertTgSession,
} from "@/lib/orderRepo";
import {
  editMenuKeyboard,
  formatOrderHtml,
  orderKeyboard,
  parseCallbackData,
  parseHm,
  parseYmd,
  type OrderRow,
  type OrderStatus,
} from "@/lib/orders";
import {
  answerCallbackQuery,
  editTelegramMessageText,
  sendTelegramMessage,
} from "@/lib/telegram";

export const runtime = "nodejs";

type TgUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    from?: { id: number; username?: string; first_name?: string; last_name?: string };
    chat?: { id: number };
  };
  callback_query?: {
    id: string;
    from: { id: number; username?: string; first_name?: string; last_name?: string };
    data?: string;
    message?: { message_id: number; chat: { id: number } };
  };
};

async function refreshCard(o: OrderRow) {
  if (!o.tg_chat_id || !o.tg_message_id) return;
  const chatId = /^-?\d+$/.test(o.tg_chat_id) ? Number(o.tg_chat_id) : o.tg_chat_id;
  const res = await editTelegramMessageText({
    chat_id: chatId,
    message_id: o.tg_message_id,
    text: formatOrderHtml(o),
    reply_markup: orderKeyboard(o.id, o.status),
  });
  if (!res.ok) {
    const desc = String(res.json?.description ?? "");
    if (!desc.toLowerCase().includes("message is not modified")) {
      console.error("[api/telegram] editMessageText failed", res.json);
    }
  }
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true });
  }

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (update.callback_query) {
    const cq = update.callback_query;
    let callbackAcked = false;
    try {
      const raw = cq.data ?? "";
      const cb = parseCallbackData(raw);
      if (!cb) {
        return NextResponse.json({ ok: true });
      }

      const order = await loadOrderById(cb.id);
      if (!order) {
        return NextResponse.json({ ok: true });
      }

      if (cb.a === "edit") {
        const chatId = cq.message?.chat.id;
        if (chatId) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: "✏️ <b>Редактирование</b>\nВыбери поле:",
            reply_markup: editMenuKeyboard(order.id),
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (cb.a === "edit_back") {
        await deleteTgSession(cq.from.id);
        return NextResponse.json({ ok: true });
      }

      if (cb.a === "edit_field") {
        await upsertTgSession(
          cq.from.id,
          { mode: "edit", orderId: order.id, field: cb.f },
          new Date(Date.now() + 10 * 60_000)
        );
        const chatId = cq.message?.chat.id;
        if (chatId) {
          const prompt =
            cb.f === "date"
              ? "Введите дату выезда в формате <code>YYYY-MM-DD</code> (пример: <code>2026-04-10</code>)."
              : cb.f === "time"
                ? "Введите время выезда в формате <code>HH:MM</code> (пример: <code>18:30</code>)."
                : "Введите комментарий / дополнительные детали (одно сообщение).";
          await sendTelegramMessage({ chat_id: chatId, text: prompt });
        }
        return NextResponse.json({ ok: true });
      }

      let nextStatus: OrderStatus | null = null;
      if (cb.a === "take") nextStatus = "in_progress";
      if (cb.a === "done") nextStatus = "done";
      if (cb.a === "cancel") nextStatus = "cancelled";

      if (nextStatus) {
        const updated = await patchOrder(order.id, { status: nextStatus });
        await refreshCard(updated);
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("[api/telegram] callback error", e);
      await answerCallbackQuery({
        callback_query_id: cq.id,
        text: "Ошибка сервера. Попробуй ещё раз.",
        show_alert: true,
      });
      callbackAcked = true;
      return NextResponse.json({ ok: true });
    } finally {
      if (!callbackAcked) {
        await answerCallbackQuery({ callback_query_id: cq.id });
      }
    }
  }

  try {
    if (update.message?.text && update.message.from && update.message.chat?.id) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;

      if (text === "/orders" || text.startsWith("/orders@")) {
        const orders = await listActiveOrders();
        const lines = orders.map((o, i) => {
          const when = `${o.visit_date ?? "—"} ${o.visit_time ?? "—"}`.trim();
          const s = o.status === "new" ? "🆕" : "🔧";
          return `${i + 1}. ${s} <b>${o.name}</b> · ${o.phone} · <code>${o.id.slice(0, 8)}</code> · ${when}`;
        });
        await sendTelegramMessage({
          chat_id: chatId,
          text:
            `📋 <b>Активные заявки</b> (${orders.length})\n` +
            "━━━━━━━━━━━━━━━━━━━━\n" +
            (lines.length ? lines.join("\n") : "— пусто —"),
        });
        return NextResponse.json({ ok: true });
      }

      const row = await getTgSession(userId);
      const session = row?.session as
        | { mode?: string; orderId?: string; field?: string }
        | undefined;
      if (session?.mode === "edit" && session.orderId && session.field) {
        const ord = await loadOrderById(session.orderId);
        if (!ord) {
          await deleteTgSession(userId);
          return NextResponse.json({ ok: true });
        }

        if (session.field === "date") {
          const ymd = parseYmd(text);
          if (!ymd) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: "Неверный формат. Нужно <code>YYYY-MM-DD</code>.",
            });
            return NextResponse.json({ ok: true });
          }
          const updated = await patchOrder(ord.id, { visit_date: ymd });
          await refreshCard(updated);
          await deleteTgSession(userId);
          await sendTelegramMessage({ chat_id: chatId, text: "✅ Дата обновлена." });
          return NextResponse.json({ ok: true });
        }

        if (session.field === "time") {
          const hm = parseHm(text);
          if (!hm) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: "Неверный формат. Нужно <code>HH:MM</code>.",
            });
            return NextResponse.json({ ok: true });
          }
          const updated = await patchOrder(ord.id, { visit_time: hm });
          await refreshCard(updated);
          await deleteTgSession(userId);
          await sendTelegramMessage({ chat_id: chatId, text: "✅ Время обновлено." });
          return NextResponse.json({ ok: true });
        }

        const updated = await patchOrder(ord.id, { visit_comment: text.slice(0, 1000) });
        await refreshCard(updated);
        await deleteTgSession(userId);
        await sendTelegramMessage({ chat_id: chatId, text: "✅ Комментарий обновлён." });
        return NextResponse.json({ ok: true });
      }
    }
  } catch (e) {
    console.error("[api/telegram]", e);
  }

  return NextResponse.json({ ok: true });
}
