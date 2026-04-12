import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminPasswordOk,
  getAdminCookieName,
  signAdminSession,
} from "@/lib/adminAuth";
import { createIpWindowLimiter, getClientIp } from "@/lib/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const failedLoginLimit = createIpWindowLimiter(15 * 60_000, 20);

const loginBodySchema = z.object({
  password: z.string().min(1).max(512),
});

function isHttpsRequest(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto === "https") return true;
  const url = new URL(request.url);
  return url.protocol === "https:";
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (!adminPasswordOk(parsed.data.password)) {
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

  const secure = process.env.NODE_ENV === "production" || isHttpsRequest(request);
  const maxAge = 7 * 24 * 60 * 60;
  const cookie = [
    `${getAdminCookieName()}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}
