import { NextResponse } from "next/server";
import {
  getTelegramEnv,
  sendTelegramMediaGroup,
  sendTelegramMessage,
} from "@/lib/telegram";
import { isLocale } from "@/lib/i18n";
import { getDatabaseUrl } from "@/lib/db";
import {
  insertOrder,
  updateOrderTelegramMeta,
} from "@/lib/orderRepo";
import { formatOrderHtml, orderKeyboard, type OrderStatus } from "@/lib/orders";
import { isAllowedSlotKey } from "@/lib/publicAvailability";
import { parseSlotId } from "@/lib/slotUtils";

export const runtime = "nodejs";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 25 * 1024 * 1024; // keep within typical Telegram limits
const MIN_HUMAN_MS = 2500;
const MIN_GAP_MS = 20_000;
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 3;

type RateState = { ts: number[]; last: number };

function getIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

function getRateMap(): Map<string, RateState> {
  const g = globalThis as unknown as {
    __repairRateLimit?: Map<string, RateState>;
  };
  if (!g.__repairRateLimit) g.__repairRateLimit = new Map();
  return g.__repairRateLimit;
}

function asString(v: FormDataEntryValue | null): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return "";
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && !origin.includes(host)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const ip = getIp(request);
  const now = Date.now();
  const rm = getRateMap();
  const st = rm.get(ip) ?? { ts: [], last: 0 };
  if (st.last && now - st.last < MIN_GAP_MS) {
    rm.set(ip, st);
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const fresh = st.ts.filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= MAX_PER_WINDOW) {
    rm.set(ip, { ts: fresh, last: st.last });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const website = asString(fd.get("website")).trim();
  if (website) return NextResponse.json({ ok: true });

  const startedAtRaw = asString(fd.get("startedAt")).trim();
  const startedAt = startedAtRaw ? Number(startedAtRaw) : NaN;
  if (!Number.isFinite(startedAt) || now - startedAt < MIN_HUMAN_MS) {
    return NextResponse.json({ error: "Too fast" }, { status: 429 });
  }

  const localeRaw = asString(fd.get("locale")).trim();
  const locale = isLocale(localeRaw) ? localeRaw : "no";

  const name = asString(fd.get("name")).trim();
  const phone = asString(fd.get("phone")).trim();
  const address = asString(fd.get("address")).trim();
  const brand = asString(fd.get("brand")).trim();
  const brandOther = asString(fd.get("brandOther")).trim();
  const model = asString(fd.get("model")).trim();
  const issue = asString(fd.get("issue")).trim();
  const errorCode = asString(fd.get("errorCode")).trim();
  const time = asString(fd.get("time")).trim();
  const slotKey = asString(fd.get("slotKey")).trim();
  const timeComment = asString(fd.get("timeComment")).trim();

  if (!name || !phone || !issue) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const digits = digitsOnly(phone);
  if (digits.length !== 10 || !digits.startsWith("47")) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }
  if (name.length < 2 || issue.length < 5) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const mediaEntries = fd.getAll("media");
  const files = mediaEntries.filter((v): v is File => v instanceof File);
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: "Too many files" }, { status: 400 });
  }

  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File is too large" }, { status: 400 });
    }
    const type = (f.type || "").toLowerCase();
    const ok = type.startsWith("image/") || type.startsWith("video/");
    if (!ok) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
  }

  let inserted;
  try {
    getDatabaseUrl();
    let preferredWindow: "today" | "tomorrow" | "soon" | null = null;
    let visitDate: string | null = null;
    let visitTime: string | null = null;

    if (slotKey) {
      const allowed = await isAllowedSlotKey(slotKey);
      if (!allowed) {
        return NextResponse.json({ error: "Invalid or unavailable time slot" }, { status: 400 });
      }
      const parsed = parseSlotId(slotKey);
      if (!parsed) {
        return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
      }
      visitDate = parsed.d;
      visitTime = `${String(parsed.h).padStart(2, "0")}:00`;
    } else {
      preferredWindow =
        time === "today" || time === "tomorrow" || time === "soon" ? time : null;
      if (!preferredWindow) {
        return NextResponse.json({ error: "Missing time preference" }, { status: 400 });
      }
    }

    inserted = await insertOrder({
      status: "new" as OrderStatus,
      locale,
      name,
      phone,
      address: address || null,
      brand:
        brand === "other"
          ? brandOther || null
          : brand === "unknown"
            ? "Не знаю"
            : brand || null,
      model: model || null,
      issue,
      error_code: errorCode || null,
      preferred_window: preferredWindow,
      preferred_comment: timeComment || null,
      visit_date: visitDate,
      visit_time: visitTime,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/repair-request] db error", e);
    if (msg.includes("Missing DATABASE_URL")) {
      return NextResponse.json(
        { error: "Database is not configured (missing DATABASE_URL)." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Storage error", detail: msg },
      { status: 502 }
    );
  }

  const { chatId } = getTelegramEnv();
  if (!chatId) {
    if (process.env.NODE_ENV === "development") {
      console.info("[api/repair-request] Telegram not configured — dev mock OK.");
      return NextResponse.json({ ok: true, devMock: true });
    }
    return NextResponse.json({ error: "Server is not configured for Telegram." }, { status: 503 });
  }

  const cardText = formatOrderHtml(inserted);
  const msg = await sendTelegramMessage({
    chat_id: chatId,
    text: cardText,
    reply_markup: orderKeyboard(inserted.id, inserted.status),
  });
  if (!msg.ok) {
    console.error("[api/repair-request] Telegram API error", msg.json);
    return NextResponse.json({ error: "Failed to notify" }, { status: 502 });
  }

  const messageId = msg.json?.result?.message_id as number | undefined;
  try {
    await updateOrderTelegramMeta(inserted.id, String(chatId), messageId ?? null);
  } catch (e) {
    console.error("[api/repair-request] failed to save tg meta", e);
  }

  rm.set(ip, { ts: [...fresh, now], last: now });

  if (files.length) {
    const media = files.map((f) => ({
      kind: f.type.startsWith("video/") ? ("video" as const) : ("photo" as const),
      file: f,
      filename: f.name,
    }));
    const mediaRes = await sendTelegramMediaGroup({ media });
    if (!mediaRes.ok) {
      console.error("Telegram media error:", mediaRes.json);
    }
  }

  return NextResponse.json({ ok: true });
}
