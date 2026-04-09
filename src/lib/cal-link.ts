/**
 * Cal.com public path for embeds: `username` or `username/event-slug`.
 * Strips pasted full URLs so env can be copied from the browser address bar.
 */
export function sanitizeCalLink(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^https?:\/\/(www\.)?(app\.)?cal\.com\//i, "");
  s = s.replace(/^\/+/, "");
  s = s.replace(/\/+$/, "");
  return s;
}

/** iframe src for hosted Cal.com (SaaS). */
export function calEmbedUrl(
  calPath: string,
  origin: string | undefined
): string {
  const base = (origin ?? "https://cal.com").replace(/\/$/, "");
  const path = sanitizeCalLink(calPath);
  const q = new URLSearchParams({ embed: "true" });
  return `${base}/${path}?${q.toString()}`;
}
