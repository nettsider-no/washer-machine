import { createHmac, timingSafeEqual } from "crypto";
import { normalizeSecret } from "@/lib/telegram";

const COOKIE_NAME = "wm_admin";

function sessionSecret(): string | undefined {
  const s = normalizeSecret(process.env.ADMIN_SESSION_SECRET);
  if (s) return s;
  const p = normalizeSecret(process.env.ADMIN_PASSWORD);
  return p ? `wm:${p}` : undefined;
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export function signAdminSession(): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const i = token.lastIndexOf(".");
  if (i <= 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length) return false;
    if (!timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"))) return false;
  } catch {
    return false;
  }
  let exp: number;
  try {
    const j = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    exp = Number(j.exp);
  } catch {
    return false;
  }
  return Number.isFinite(exp) && Date.now() < exp;
}

export function readAdminCookie(request: Request): boolean {
  const raw = request.headers.get("cookie") ?? "";
  const parts = raw.split(";").map((c) => c.trim());
  for (const p of parts) {
    if (p.startsWith(`${COOKIE_NAME}=`)) {
      const v = decodeURIComponent(p.slice(COOKIE_NAME.length + 1));
      return verifyAdminSessionToken(v);
    }
  }
  return false;
}

export function adminPasswordOk(pw: string | undefined): boolean {
  const expected = normalizeSecret(process.env.ADMIN_PASSWORD);
  if (!expected || !pw) return false;
  const a = Buffer.from(pw, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
