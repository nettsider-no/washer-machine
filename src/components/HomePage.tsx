"use client";

import { Header } from "./Header";
import { HeroVisual } from "./HeroVisual";
import { ContactForm } from "./ContactForm";
import { useLocale } from "./LocaleProvider";

export function HomePage() {
  const { t } = useLocale();

  return (
    <div id="top" className="min-h-screen">
      <Header />

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
          <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="flex flex-col gap-6">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-6xl">
                <span className="bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-transparent">
                  {t.heroTitle}
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
                {t.heroSubtitle}
              </p>
              <a
                href="#contact"
                className="inline-flex w-fit items-center rounded-full border border-cyan-400/40 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 hover:shadow-[0_0_24px_rgba(34,211,238,0.2)]"
              >
                {t.heroCta}
              </a>
            </div>
            <div className="flex justify-center lg:justify-end">
              <HeroVisual />
            </div>
          </div>
        </section>

        <section
          id="services"
          className="border-t border-white/10 bg-black/20 px-4 py-20 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white sm:text-3xl">
              {t.servicesTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-zinc-400">{t.servicesIntro}</p>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2">
              {t.services.map((s, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a0f2e]/80 to-[#0d1624]/80 p-6 shadow-lg shadow-black/20"
                >
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-fuchsia-300">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {s.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="contact"
          className="border-t border-white/10 px-4 py-20 sm:px-6"
        >
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white sm:text-3xl">
              {t.contactTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              {t.contactLead}
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-zinc-500 sm:px-6">
        <p>
          © {new Date().getFullYear()} · {t.footerArea}
        </p>
      </footer>
    </div>
  );
}
