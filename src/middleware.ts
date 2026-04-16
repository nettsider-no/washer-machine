import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getReqIp(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return (xff.split(",")[0]?.trim() || "unknown");
  return "unknown";
}

function adminIpAllowlist(): Set<string> | null {
  const raw = process.env.ADMIN_IP_ALLOWLIST?.trim();
  if (!raw) return null;
  const ips = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ips.length) return null;
  return new Set(ips);
}

/**
 * CSP без nonce: Next.js вставляет inline-скрипты для гидрации — без unsafe-inline
 * продакшен часто ломается. unsafe-eval только в dev (HMR).
 */
function buildCsp(dev: boolean): string {
  const scriptSrc = dev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    /** Без `https:` — иначе ZAP считает img-src «wildcard»; внешних картинок в UI нет. */
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    // Allow embedding Google Maps (Apple Maps is opened via deep-link, not iframed).
    "frame-src 'self' https://www.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function middleware(_request: NextRequest) {
  const dev = process.env.NODE_ENV === "development";
  const request = _request;

  const allow = adminIpAllowlist();
  if (allow) {
    const p = request.nextUrl.pathname;
    if (p === "/admin" || p.startsWith("/admin/") || p.startsWith("/api/admin/")) {
      const ip = getReqIp(request);
      if (!allow.has(ip)) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  const res = NextResponse.next();

  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  /** same-origin строже same-site; ZAP рекомендует для документов. */
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  /**
   * COEP ломает встраивание некоторых 3rd-party iframe (включая Google Maps embed).
   * Мы не используем crossOrigin isolation — поэтому оставляем COEP выключенным
   * для совместимости с картой в секции "Зона обслуживания".
   */
  res.headers.delete("Cross-Origin-Embedder-Policy");

  if (!dev) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  res.headers.set("Content-Security-Policy", buildCsp(dev));

  return res;
}

export const config = {
  matcher: [
    /**
     * Включая /_next/static (чанки, шрифты) — иначе заголовки не попадают на ассеты (ZAP: CORP, Permissions-Policy, nosniff).
     * Исключаем _next/image (оптимизация), favicon и типичные файлы из public по расширению.
     */
    "/((?!_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
