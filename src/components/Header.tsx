"use client";

import { useLocale, LOCALES, type Locale } from "./LocaleProvider";

const labels: Record<Locale, string> = { no: "NO", ru: "RU", en: "EN" };

export function Header() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f0820]/80 backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="group font-[family-name:var(--font-display)] text-sm font-bold tracking-widest text-cyan-300 transition-colors duration-200 hover:text-cyan-200 active:scale-[0.98] sm:text-base"
        >
          WM<span className="text-fuchsia-400 transition-colors duration-200 group-hover:text-fuchsia-300/90">.</span>SERVICE
        </a>
        <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
          <a
            href="#services"
            className="relative transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-cyan-400/70 after:transition-transform after:duration-200 hover:text-cyan-300 hover:after:scale-x-100"
          >
            {t.navServices}
          </a>
          <a
            href="#request"
            className="relative transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-cyan-400/70 after:transition-transform after:duration-200 hover:text-cyan-300 hover:after:scale-x-100"
          >
            {t.navRequest}
          </a>
        </nav>
        <div
          className="flex items-center gap-1 rounded-full border border-white/15 bg-black/30 p-1"
          role="group"
          aria-label="Language"
        >
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 sm:px-3 ${
                locale === code
                  ? "bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {labels[code]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
