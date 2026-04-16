"use client";

import { useEffect, useMemo, useState } from "react";

function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Apple Maps is best-supported/expected on Apple devices.
  return /Macintosh|Mac OS X|iPhone|iPad|iPod/i.test(ua);
}

type Props = {
  className?: string;
  title: string;
  caption: string;
  /** Oslo default */
  center?: { lat: number; lng: number };
  /** Visual "zone" overlay radius in px (not geodesic). */
  zoneRadiusPx?: number;
};

export function ServiceAreaMap({
  className,
  title,
  caption,
  center = { lat: 59.9139, lng: 10.7522 },
  zoneRadiusPx = 86,
}: Props) {
  const [useApple, setUseApple] = useState(false);

  useEffect(() => {
    setUseApple(isApplePlatform());
  }, []);

  const { appleHref, googleEmbedSrc } = useMemo(() => {
    const ll = `${center.lat},${center.lng}`;
    const apple = `https://maps.apple.com/?q=${encodeURIComponent(
      "Oslo"
    )}&ll=${encodeURIComponent(ll)}&z=10&spn=0.6,0.6`;
    // Note: Apple Maps does not allow embedding in an iframe (it is blocked by browser security headers).
    // Use Google Maps embed in the page, and offer an Apple Maps deep-link on Apple devices.
    const google =
      "https://www.google.com/maps/embed?pb=" +
      "!1m18!1m12!1m3!1d72395.53356536664!2d10.65976055664062!3d59.91386879999999" +
      "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1" +
      "!3m3!1m2!1s0x46416e61f267f03d%3A0x5fd9653d8f0c595!2sOslo%2C%20Norway" +
      "!5e0!3m2!1sen!2sno!4v1";
    return { appleHref: apple, googleEmbedSrc: google };
  }, [center.lat, center.lng]);

  return (
    <figure className={className}>
      <div className="rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]">
        <div className="flex items-center justify-between gap-4 px-4 pt-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {title}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{caption}</p>
          </div>
          {useApple ? (
            <a
              href={appleHref}
              target="_blank"
              rel="noreferrer"
              className="hidden shrink-0 rounded-full border border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-ink)] transition hover:brightness-[1.02] sm:inline"
            >
              Open in Apple Maps
            </a>
          ) : (
            <span className="hidden shrink-0 rounded-full border border-[var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] sm:inline">
              Google Maps
            </span>
          )}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-b-2xl">
          <iframe
            title={title}
            src={googleEmbedSrc}
            className="h-[280px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Highlight overlay: Oslo + region */}
          <div
            className="pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2"
            style={{ width: zoneRadiusPx * 2, height: zoneRadiusPx * 2 }}
            aria-hidden
          >
            <div className="absolute inset-0 rounded-full border-2 border-[color:var(--accent)]/30 bg-[color:var(--accent-bg)] blur-[0.2px]" />
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--accent)]" />
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--accent)]/25" />
          </div>
        </div>
      </div>
    </figure>
  );
}

