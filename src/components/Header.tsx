"use client";

import { useLocale, LOCALES, type Locale } from "./LocaleProvider";

const labels: Record<Locale, string> = { no: "NO", ru: "RU", en: "EN" };

export function Header() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f0820]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="font-[family-name:var(--font-display)] text-sm font-bold tracking-widest text-cyan-300 sm:text-base"
        >
          WM<span className="text-fuchsia-400">.</span>SERVICE
        </a>
        <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
          <a href="#services" className="transition hover:text-cyan-300">
            {t.navServices}
          </a>
          <a href="#contact" className="transition hover:text-cyan-300">
            {t.navContact}
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
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition sm:px-3 ${
                locale === code
                  ? "bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                  : "text-zinc-400 hover:text-white"
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
