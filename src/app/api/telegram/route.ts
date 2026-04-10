import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  editMenuKeyboard,
  formatOrderHtml,
  orderKeyboard,
  parseHm,
  parseYmd,
  type OrderRow,
  type OrderStatus,
} from "@/lib/orders";
import { editTelegramMessageText, sendTelegramMessage } from "@/lib/telegram";

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

type Cb =
  | { v: 1; a: "take" | "edit" | "done" | "cancel" | "edit_back"; id: string }
  | { v: 1; a: "edit_field"; id: string; f: "date" | "time" | "comment" };

function decodeCb(raw: string): Cb | null {
  try {
    const j = JSON.parse(raw) as any;
    if (!j || j.v !== 1 || typeof j.a !== "string" || typeof j.id !== "string")
      return null;
    if (j.a === "edit_field") {
      if (j.f !== "date" && j.f !== "time" && j.f !== "comment") return null;
    }
    return j as Cb;
  } catch {
    return null;
  }
}

async function loadOrder(id: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as OrderRow | null;
}

async function patchOrder(id: string, patch: Partial<OrderRow>) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as OrderRow;
}

async function setSession(userId: number, session: any) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from("tg_sessions").upsert(
    {
      user_id: userId,
      session,
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

async function getSession(userId: number) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("tg_sessions")
    .select("session,expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const exp = data.expires_at ? Date.parse(data.expires_at) : 0;
  if (!exp || Date.now() > exp) return null;
  return data.session as any;
}

async function clearSession(userId: number) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from("tg_sessions").delete().eq("user_id", userId);
  if (error) throw error;
}

async function refreshCard(o: OrderRow) {
  if (!o.tg_chat_id || !o.tg_message_id) return;
  const chatId = /^-?\d+$/.test(o.tg_chat_id) ? Number(o.tg_chat_id) : o.tg_chat_id;
  await editTelegramMessageText({
    chat_id: chatId,
    message_id: o.tg_message_id,
    text: formatOrderHtml(o),
    reply_markup: orderKeyboard(o.id, o.status),
  });
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

  // Callback buttons
  if (update.callback_query) {
    const cq = update.callback_query;
    const raw = cq.data ?? "";
    const cb = decodeCb(raw);
    if (!cb) return NextResponse.json({ ok: true });

    const order = await loadOrder(cb.id);
    if (!order) return NextResponse.json({ ok: true });

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
      await clearSession(cq.from.id);
      return NextResponse.json({ ok: true });
    }

    if (cb.a === "edit_field") {
      await setSession(cq.from.id, { mode: "edit", orderId: order.id, field: cb.f });
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
  }

  // Text messages: used for editing flow + /orders
  if (update.message?.text && update.message.from && update.message.chat?.id) {
    const text = update.message.text.trim();
    const chatId = update.message.chat.id;
    const userId = update.message.from.id;

    if (text === "/orders" || text.startsWith("/orders@")) {
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .in("status", ["new", "in_progress"])
        .order("visit_date", { ascending: true, nullsFirst: false })
        .order("visit_time", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;

      const orders = (data as OrderRow[]) ?? [];
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

    const session = await getSession(userId);
    if (session?.mode === "edit" && session.orderId && session.field) {
      const order = await loadOrder(session.orderId);
      if (!order) {
        await clearSession(userId);
        return NextResponse.json({ ok: true });
      }

      if (session.field === "date") {
        const ymd = parseYmd(text);
        if (!ymd) {
          await sendTelegramMessage({ chat_id: chatId, text: "Неверный формат. Нужно <code>YYYY-MM-DD</code>." });
          return NextResponse.json({ ok: true });
        }
        const updated = await patchOrder(order.id, { visit_date: ymd });
        await refreshCard(updated);
        await clearSession(userId);
        await sendTelegramMessage({ chat_id: chatId, text: "✅ Дата обновлена." });
        return NextResponse.json({ ok: true });
      }

      if (session.field === "time") {
        const hm = parseHm(text);
        if (!hm) {
          await sendTelegramMessage({ chat_id: chatId, text: "Неверный формат. Нужно <code>HH:MM</code>." });
          return NextResponse.json({ ok: true });
        }
        const updated = await patchOrder(order.id, { visit_time: hm });
        await refreshCard(updated);
        await clearSession(userId);
        await sendTelegramMessage({ chat_id: chatId, text: "✅ Время обновлено." });
        return NextResponse.json({ ok: true });
      }

      const updated = await patchOrder(order.id, { visit_comment: text.slice(0, 1000) });
      await refreshCard(updated);
      await clearSession(userId);
      await sendTelegramMessage({ chat_id: chatId, text: "✅ Комментарий обновлён." });
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ ok: true });
}

