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

const failedLoginLimit = createIpWindowLimiter(15 * 60_000, 10);

const loginBodySchema = z.object({
  password: z.string().min(1).max(512),
});

type BackoffState = { fails: number; until: number };

function getBackoffMap(): Map<string, BackoffState> {
  const g = globalThis as unknown as { __adminLoginBackoff?: Map<string, BackoffState> };
  if (!g.__adminLoginBackoff) g.__adminLoginBackoff = new Map();
  return g.__adminLoginBackoff;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isHttpsRequest(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto === "https") return true;
  const url = new URL(request.url);
  return url.protocol === "https:";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const bm = getBackoffMap();
  const b = bm.get(ip);
  if (b && now < b.until) {
    const wait = Math.min(2_000, b.until - now);
    if (wait > 0) await sleep(wait);
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

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
    if (!failedLoginLimit(ip)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }
    const prev = bm.get(ip);
    const fails = Math.min(20, (prev?.fails ?? 0) + 1);
    const base = 350;
    const cap = 8_000;
    const delay = Math.min(cap, Math.round(base * 2 ** Math.min(6, fails - 1)));
    const jitter = Math.floor(Math.random() * 120);
    bm.set(ip, { fails, until: Date.now() + delay + jitter });
    await sleep(Math.min(1_200, delay + jitter));
    return NextResponse.json({ ok: false, error: "invalid_password" }, { status: 401 });
  }

  bm.delete(ip);

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
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
    secure ? "Secure" : "",
    "Priority=High",
  ]
    .filter(Boolean)
    .join("; ");

  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}
