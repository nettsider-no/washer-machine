import { NextResponse } from "next/server";
import { escapeHtml, sendTelegramHtml, sendTelegramMediaGroup } from "@/lib/telegram";
import { isLocale } from "@/lib/i18n";

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

function timeLabel(v: string) {
  if (v === "today") return "Сегодня / Today";
  if (v === "tomorrow") return "Завтра / Tomorrow";
  if (v === "soon") return "В ближайшие дни / Next days";
  return v;
}

export async function POST(request: Request) {
  // Basic origin check (helps against cross-site form spam).
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && !origin.includes(host)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  // Simple in-memory rate limit (best-effort; works well on a single instance).
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

  const brandLine =
    brand === "other"
      ? brandOther
        ? `🧺 <b>Марка:</b> ${escapeHtml(brandOther)}`
        : `🧺 <b>Марка:</b> Другая (не указана)`
      : brand === "unknown"
        ? `🧺 <b>Марка:</b> Не знаю`
        : brand
          ? `🧺 <b>Марка:</b> ${escapeHtml(brand)}`
          : `🧺 <b>Марка:</b> —`;

  const header = [
    "🛠️ <b>Заявка на ремонт стиральной машины</b>",
    "━━━━━━━━━━━━━━━━━━━━",
  ].join("\n");

  const text = [
    header,
    `👤 <b>Имя:</b> ${escapeHtml(name)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(phone)}`,
    address ? `📍 <b>Адрес:</b> ${escapeHtml(address)}` : `📍 <b>Адрес:</b> —`,
    brandLine,
    model ? `🔎 <b>Модель:</b> ${escapeHtml(model)}` : `🔎 <b>Модель:</b> —`,
    "━━━━━━━━━━━━━━━━━━━━",
    `🧰 <b>Проблема:</b>\n${escapeHtml(issue)}`,
    errorCode ? `⚠️ <b>Код ошибки:</b> ${escapeHtml(errorCode)}` : "",
    "━━━━━━━━━━━━━━━━━━━━",
    `🕒 <b>Время:</b> ${escapeHtml(timeLabel(time))}`,
    timeComment ? `📝 <b>Комментарий:</b> ${escapeHtml(timeComment)}` : "",
    "",
    `🌐 <b>Locale:</b> ${escapeHtml(locale)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const msg = await sendTelegramHtml(text);
  if (!msg.ok) {
    if (process.env.NODE_ENV === "development") {
      console.info("[api/repair-request] Telegram error (dev mock).", msg.json);
      return NextResponse.json({ ok: true, devMock: true });
    }
    return NextResponse.json({ error: "Failed to notify" }, { status: 502 });
  }

  // Update rate limit only after successful message delivery.
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
      // Don't fail the request: the text is already delivered.
    }
  }

  return NextResponse.json({ ok: true });
}

