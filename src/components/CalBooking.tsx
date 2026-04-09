"use client";

import { calEmbedUrl, sanitizeCalLink } from "@/lib/cal-link";

export function CalBooking({ missingMessage }: { missingMessage: string }) {
  const raw = process.env.NEXT_PUBLIC_CALCOM_LINK?.trim();
  const calOrigin = process.env.NEXT_PUBLIC_CALCOM_ORIGIN?.trim();
  const path = raw ? sanitizeCalLink(raw) : "";

  if (!path) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-8 text-center text-sm leading-relaxed text-amber-100/90">
        {missingMessage}
      </div>
    );
  }

  const src = calEmbedUrl(path, calOrigin);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <iframe
        title="Cal.com booking"
        src={src}
        className="min-h-[min(720px,90vh)] w-full border-0 bg-[#0a0612]"
        loading="lazy"
        allow="camera; microphone; payment; clipboard-write"
      />
    </div>
  );
}
