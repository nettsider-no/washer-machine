"use client";

import dynamic from "next/dynamic";

const Cal = dynamic(() => import("@calcom/embed-react").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[620px] items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm text-zinc-500">
      Loading…
    </div>
  ),
});

export function CalBooking({ missingMessage }: { missingMessage: string }) {
  const calLink = process.env.NEXT_PUBLIC_CALCOM_LINK?.trim();
  const calOrigin = process.env.NEXT_PUBLIC_CALCOM_ORIGIN?.trim();

  if (!calLink) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-8 text-center text-sm leading-relaxed text-amber-100/90">
        {missingMessage}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <Cal
        calLink={calLink}
        calOrigin={calOrigin || undefined}
        style={{ width: "100%", height: "100%", minHeight: "620px" }}
        config={{ layout: "month_view" }}
      />
    </div>
  );
}
