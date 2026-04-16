"use client";

import { useLocale, LOCALES, type Locale } from "./LocaleProvider";
import { ThemeToggle } from "./ThemeToggle";
import { LogoMark } from "./LogoMark";

const labels: Record<Locale, string> = { no: "NO", ru: "RU", en: "EN" };

export function Header() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[color:var(--surface-strong)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="group flex items-center gap-2 font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-[var(--foreground)] transition-colors duration-200 hover:text-[color:var(--accent-ink)] active:translate-y-px active:scale-[0.98] sm:text-base"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[color:var(--surface)]">
            <LogoMark className="h-5 w-5" />
          </span>
          <span>
            WM
            <span className="text-[color:var(--accent)] transition-colors duration-200 group-hover:text-[color:var(--accent-ink)]">
              .
            </span>
            SERVICE
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
          <a
            href="#services"
            className="relative transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[color:var(--accent-border)] after:transition-transform after:duration-200 hover:text-[var(--foreground)] hover:after:scale-x-100"
          >
            {t.navServices}
          </a>
          <a
            href="#area"
            className="relative transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[color:var(--accent-border)] after:transition-transform after:duration-200 hover:text-[var(--foreground)] hover:after:scale-x-100"
          >
            {t.navArea}
          </a>
          <a
            href="#request"
            className="relative transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[color:var(--accent-border)] after:transition-transform after:duration-200 hover:text-[var(--foreground)] hover:after:scale-x-100"
          >
            {t.navRequest}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="flex shrink-0" />
          <div
            className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[color:var(--surface)] p-1"
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
                    ? "bg-[color:var(--accent-bg)] text-[var(--foreground)] shadow-[0_16px_48px_-28px_rgba(2,6,23,0.55)]"
                    : "text-[var(--muted)] hover:bg-[color:var(--surface-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                {labels[code]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
