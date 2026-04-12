/**
 * Общие проверки для публичных API (форма заявки, контакт).
 * Секреты БД и Telegram только на сервере — клиент их не видит.
 */

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

/**
 * Та же логика, что у repair-request: если браузер прислал Origin,
 * он должен совпадать с Host (защита от простых CSRF с чужих сайтов).
 * Запросы без Origin (curl и т.п.) пропускаются — как раньше.
 */
export function isOriginAllowedForSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true;
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type WindowState = { hits: number[] };

export function createIpWindowLimiter(windowMs: number, maxHits: number) {
  const map = new Map<string, WindowState>();
  return function allow(ip: string): boolean {
    const now = Date.now();
    let st = map.get(ip);
    if (!st) {
      st = { hits: [] };
      map.set(ip, st);
    }
    st.hits = st.hits.filter((t) => now - t < windowMs);
    if (st.hits.length >= maxHits) return false;
    st.hits.push(now);
    return true;
  };
}
