import { NextResponse } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n";

const COOKIE = "wash_locale";
const MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  let body: { locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const locale = body.locale;
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(COOKIE, locale, {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
  });
  return res;
}
