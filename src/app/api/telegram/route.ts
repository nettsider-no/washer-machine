import { NextResponse } from "next/server";
import {
  listActiveOrders,
  loadOrderById,
  patchOrder,
} from "@/lib/orderRepo";
import {
  formatOrderHtml,
  orderKeyboard,
  parseCallbackData,
  parseStaleCardOrderId,
  type OrderRow,
  type OrderStatus,
} from "@/lib/orders";
import {
  answerCallbackQuery,
  editTelegramMessageText,
  normalizeSecret,
  sendTelegramMessage,
} from "@/lib/telegram";
import { createIpWindowLimiter, getClientIp } from "@/lib/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Защита от флуда телеграм-вебхука (аномальный трафик / DoS). */
const webhookBurstLimit = createIpWindowLimiter(60_000, 200);

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

type CardMessageRef = { chat: { id: number }; message_id: number };

function isBotCommand(text: string, command: string): boolean {
  const first = text.trim().split(/\s+/)[0] ?? "";
  if (first === command) return true;
  return first.startsWith(`${command}@`);
}

function resolveCardTarget(
  o: OrderRow,
  ref?: CardMessageRef
): { chat_id: string | number; message_id: number } | null {
  if (ref) {
    return { chat_id: ref.chat.id, message_id: ref.message_id };
  }
  if (!o.tg_chat_id || o.tg_message_id == null) {
    console.warn("[api/telegram] refreshCard: no tg_chat_id/tg_message_id in DB and no callback message", {
      orderId: o.id,
    });
    return null;
  }
  const chatId = /^-?\d+$/.test(o.tg_chat_id) ? Number(o.tg_chat_id) : o.tg_chat_id;
  return { chat_id: chatId, message_id: o.tg_message_id };
}

async function refreshCard(o: OrderRow, messageRef?: CardMessageRef) {
  const target = resolveCardTarget(o, messageRef);
  if (!target) return;
  const res = await editTelegramMessageText({
    chat_id: target.chat_id,
    message_id: target.message_id,
    text: formatOrderHtml(o),
    reply_markup: orderKeyboard(o.id, o.status),
  });
  if (!res.ok) {
    const desc = String(res.json?.description ?? "");
    if (!desc.toLowerCase().includes("message is not modified")) {
      console.error("[api/telegram] editMessageText failed");
    }
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!webhookBurstLimit(ip)) {
    return NextResponse.json({ ok: true });
  }

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const expected = normalizeSecret(process.env.TELEGRAM_WEBHOOK_SECRET);
  const got = normalizeSecret(request.headers.get("x-telegram-bot-api-secret-token") ?? undefined);
  if (expected && got !== expected) {
    console.error("[api/telegram] webhook secret mismatch (check setWebhook secret_token vs Vercel TELEGRAM_WEBHOOK_SECRET)");
    if (update.callback_query?.id) {
      await answerCallbackQuery({
        callback_query_id: update.callback_query.id,
        text: "Вебхук: неверный secret. Сверь TELEGRAM_WEBHOOK_SECRET в Vercel и secret_token в setWebhook.",
        show_alert: true,
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (update.callback_query) {
    const cq = update.callback_query;
    const replyChat = cq.message?.chat.id;

    await answerCallbackQuery({ callback_query_id: cq.id });

    try {
      const raw = cq.data ?? "";
      const cb = parseCallbackData(raw);
      if (!cb) {
        const staleOrderId = parseStaleCardOrderId(raw);
        const msg = cq.message;
        if (staleOrderId && msg) {
          let stale = await loadOrderById(staleOrderId);
          if (stale) {
            const cid = String(msg.chat.id);
            const mid = msg.message_id;
            if (stale.tg_chat_id !== cid || stale.tg_message_id !== mid) {
              stale = await patchOrder(stale.id, { tg_chat_id: cid, tg_message_id: mid });
            }
            await editTelegramMessageText({
              chat_id: msg.chat.id,
              message_id: mid,
              text: formatOrderHtml(stale),
              reply_markup: orderKeyboard(stale.id, stale.status),
            });
            return NextResponse.json({ ok: true });
          }
        }
        if (replyChat) {
          await sendTelegramMessage({
            chat_id: replyChat,
            text: "Кнопка устарела. Отправьте новую заявку с сайта — под этим сообщением будет актуальная карточка.",
          });
        }
        return NextResponse.json({ ok: true });
      }

      let order = await loadOrderById(cb.id);
      if (!order) {
        if (replyChat) {
          await sendTelegramMessage({
            chat_id: replyChat,
            text: "Заявка не найдена в базе.",
          });
        }
        return NextResponse.json({ ok: true });
      }

      const cardRef: CardMessageRef | undefined = cq.message
        ? { chat: cq.message.chat, message_id: cq.message.message_id }
        : undefined;
      if (cardRef) {
        const cid = String(cardRef.chat.id);
        const mid = cardRef.message_id;
        if (order.tg_chat_id !== cid || order.tg_message_id !== mid) {
          order = await patchOrder(order.id, { tg_chat_id: cid, tg_message_id: mid });
        }
      }

      let nextStatus: OrderStatus | null = null;
      if (cb.a === "take") nextStatus = "in_progress";
      if (cb.a === "done") nextStatus = "done";
      if (cb.a === "cancel") nextStatus = "cancelled";

      if (nextStatus) {
        const patch =
          nextStatus === "cancelled"
            ? { status: nextStatus, visit_date: null as string | null, visit_time: null as string | null }
            : { status: nextStatus };
        const updated = await patchOrder(order.id, patch);
        await refreshCard(updated, cardRef);
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("[api/telegram] callback error", e);
      if (replyChat) {
        await sendTelegramMessage({
          chat_id: replyChat,
          text: "Ошибка сервера. Попробуй через минуту или проверь логи Vercel.",
        });
      }
      return NextResponse.json({ ok: true });
    }
  }

  try {
    if (update.message?.text && update.message.from && update.message.chat?.id) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;

      if (isBotCommand(text, "/orders")) {
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
    }
  } catch (e) {
    console.error("[api/telegram]", e);
  }

  return NextResponse.json({ ok: true });
}
