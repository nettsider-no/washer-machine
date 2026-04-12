import { NextResponse } from "next/server";
import {
  adminPasswordOk,
  getAdminCookieName,
  signAdminSession,
} from "@/lib/adminAuth";
import { createIpWindowLimiter, getClientIp } from "@/lib/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Только неудачные попытки входа: 20 / 15 мин с одного IP. */
const failedLoginLimit = createIpWindowLimiter(15 * 60_000, 20);

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!adminPasswordOk(body.password)) {
    const ip = getClientIp(request);
    if (!failedLoginLimit(ip)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }
    return NextResponse.json({ ok: false, error: "invalid_password" }, { status: 401 });
  }
  const token = signAdminSession();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 503 }
    );
  }
  const secure = process.env.NODE_ENV === "production";
  const cookie = `${getAdminCookieName()}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${secure ? "; Secure" : ""}`;
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}
