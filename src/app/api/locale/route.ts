import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocale } from "@/lib/i18n";

const COOKIE = "wash_locale";
const MAX_AGE = 60 * 60 * 24 * 365;

const localeBodySchema = z.object({
  locale: z.string().min(2).max(16),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = localeBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const loc = parsed.data.locale;
  if (!isLocale(loc)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const locale = loc;
  const res = NextResponse.json({ ok: true, locale });
  const secure =
    process.env.NODE_ENV === "production" ||
    request.headers.get("x-forwarded-proto") === "https";
  res.cookies.set(COOKIE, locale, {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    secure,
  });
  return res;
}
