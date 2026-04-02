export function HeroVisual() {
  return (
    <div
      className="relative h-[280px] w-full max-w-lg sm:h-[360px]"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-600/20 via-cyan-500/15 to-yellow-400/10 blur-2xl" />
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-500/30 to-transparent shadow-[0_0_40px_rgba(34,211,238,0.4)]" />
      <div className="absolute left-[18%] top-[22%] h-14 w-14 rotate-12 rounded-lg border border-fuchsia-400/50 bg-fuchsia-500/20 shadow-[0_0_24px_rgba(217,70,239,0.35)]" />
      <div className="absolute right-[15%] top-[28%] h-10 w-10 -rotate-6 rounded-full border border-yellow-300/50 bg-yellow-400/15 shadow-[0_0_20px_rgba(250,204,21,0.3)]" />
      <div className="absolute bottom-[20%] left-[12%] h-12 w-12 rounded-full border border-cyan-300/40 bg-cyan-400/10" />
      <div className="absolute bottom-[18%] right-[20%] h-16 w-16 rotate-45 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm" />
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}
