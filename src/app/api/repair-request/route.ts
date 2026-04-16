import { NextResponse } from "next/server";
import {
  getTelegramEnv,
  sendTelegramMediaGroup,
  sendTelegramMessage,
} from "@/lib/telegram";
import { isLocale } from "@/lib/i18n";
import { getClientIp, isOriginAllowedForSite } from "@/lib/requestSecurity";
import { getDatabaseUrl } from "@/lib/db";
import { insertOrder, updateOrderTelegramMeta } from "@/lib/orderRepo";
import { formatOrderHtml, orderKeyboard, type OrderStatus } from "@/lib/orders";
import { isSlotBookable } from "@/lib/publicAvailability";
import { parseSlotId } from "@/lib/slotUtils";
import { repairRequestFieldsSchema } from "@/lib/validation/repairRequest";
import { fileMatchesClaimedImageOrVideo } from "@/lib/fileSniff";

export const runtime = "nodejs";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MIN_HUMAN_MS = 2500;
const MIN_GAP_MS = 20_000;
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 3;

type RateState = { ts: number[]; last: number };

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

export async function POST(request: Request) {
  if (!isOriginAllowedForSite(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
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

  const parsed = repairRequestFieldsSchema.safeParse({
    website: asString(fd.get("website")),
    startedAt: asString(fd.get("startedAt")),
    locale: asString(fd.get("locale")),
    name: asString(fd.get("name")),
    phone: asString(fd.get("phone")),
    address: asString(fd.get("address")),
    brand: asString(fd.get("brand")),
    brandOther: asString(fd.get("brandOther")),
    model: asString(fd.get("model")),
    issue: asString(fd.get("issue")),
    errorCode: asString(fd.get("errorCode")),
    time: asString(fd.get("time")) || undefined,
    slotKey: asString(fd.get("slotKey")) || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const fields = parsed.data;
  const localeRaw = (fields.locale ?? "").trim();
  const locale = isLocale(localeRaw) ? localeRaw : "no";

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
    const mimeOk = type.startsWith("image/") || type.startsWith("video/");
    if (!mimeOk) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    const sniffOk = await fileMatchesClaimedImageOrVideo(f);
    if (!sniffOk) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
  }

  let inserted;
  try {
    getDatabaseUrl();
    let preferredWindow: "today" | "tomorrow" | "soon" | null = null;
    let visitDate: string | null = null;
    let visitTime: string | null = null;

    const slotKey = fields.slotKey?.trim() ?? "";

    if (slotKey) {
      const bookable = await isSlotBookable(slotKey);
      if (!bookable) {
        return NextResponse.json(
          { ok: false, error: "slot_taken", code: "slot_taken" },
          { status: 409 }
        );
      }
      const parsedSlot = parseSlotId(slotKey);
      if (!parsedSlot) {
        return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
      }
      visitDate = parsedSlot.d;
      visitTime = `${String(parsedSlot.h).padStart(2, "0")}:00`;
    } else {
      const time = fields.time;
      preferredWindow =
        time === "today" || time === "tomorrow" || time === "soon" ? time : null;
      if (!preferredWindow) {
        return NextResponse.json({ error: "Missing time preference" }, { status: 400 });
      }
    }

    const brand = fields.brand?.trim() ?? "";
    const brandOther = fields.brandOther?.trim() ?? "";

    inserted = await insertOrder({
      status: "new" as OrderStatus,
      locale,
      name: fields.name.trim(),
      phone: fields.phone.trim(),
      address: fields.address?.trim() ? fields.address.trim() : null,
      brand:
        brand === "other"
          ? brandOther || null
          : brand === "unknown"
            ? "Не знаю"
            : brand || null,
      model: fields.model?.trim() ? fields.model.trim() : null,
      issue: fields.issue.trim(),
      error_code: fields.errorCode?.trim() ? fields.errorCode.trim() : null,
      preferred_window: preferredWindow,
      preferred_comment: null,
      visit_date: visitDate,
      visit_time: visitTime,
    });
  } catch (e) {
    const pg = e as { code?: string };
    if (pg?.code === "23505") {
      return NextResponse.json(
        { ok: false, error: "slot_taken", code: "slot_taken" },
        { status: 409 }
      );
    }
    console.error("[api/repair-request] db error", e);
    if (
      e instanceof Error &&
      e.message.includes("Missing DATABASE_URL")
    ) {
      return NextResponse.json(
        { error: "Database is not configured (missing DATABASE_URL)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Storage error" }, { status: 502 });
  }

  const { chatId } = getTelegramEnv();
  if (!chatId) {
    if (process.env.NODE_ENV === "development") {
      console.info("[api/repair-request] Telegram not configured — dev mock OK.");
      return NextResponse.json({ ok: true, devMock: true });
    }
    return NextResponse.json(
      { error: "Server is not configured for Telegram." },
      { status: 503 }
    );
  }

  const cardText = formatOrderHtml(inserted);
  const msg = await sendTelegramMessage({
    chat_id: chatId,
    text: cardText,
    reply_markup: orderKeyboard(inserted.id),
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
      console.error("[api/repair-request] Telegram media error", mediaRes.json);
    }
  }

  return NextResponse.json({ ok: true });
}
