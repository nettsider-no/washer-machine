import { NextResponse } from "next/server";
import { escapeHtml, sendTelegramHtml, sendTelegramMediaGroup } from "@/lib/telegram";
import { isLocale } from "@/lib/i18n";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 25 * 1024 * 1024; // keep within typical Telegram limits

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
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const website = asString(fd.get("website")).trim();
  if (website) return NextResponse.json({ ok: true });

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
  if (digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
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

