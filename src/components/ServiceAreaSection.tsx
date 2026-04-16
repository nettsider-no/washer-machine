import { DrawingPinIcon, GlobeIcon, LapTimerIcon, SewingPinFilledIcon } from "@radix-ui/react-icons";
import { ServiceAreaMap } from "./ServiceAreaMap";

type Props = {
  title: string;
  lead: string;
  bullets: string[];
  mapTitle: string;
  mapCaption: string;
  primaryLabel: string;
  secondaryLabel: string;
};

export function ServiceAreaSection({
  title,
  lead,
  bullets,
  mapTitle,
  mapCaption,
  primaryLabel,
  secondaryLabel,
}: Props) {
  return (
    <section
      id="area"
      className="border-t border-[var(--border)] bg-[color:var(--surface)] px-4 py-20 sm:px-6"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-[var(--foreground)] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">{lead}</p>

          <ul className="mt-8 grid gap-3">
            {bullets.map((text, idx) => {
              const Icon =
                idx % 4 === 0
                  ? DrawingPinIcon
                  : idx % 4 === 1
                    ? LapTimerIcon
                    : idx % 4 === 2
                      ? GlobeIcon
                      : SewingPinFilledIcon;
              return (
                <li
                  key={text}
                  className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[color:var(--surface-strong)] px-4 py-3"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[color:var(--surface)]">
                    <Icon className="h-4 w-4 text-[color:var(--accent-ink)]" />
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">{text}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-[0_20px_60px_-45px_rgba(2,6,23,0.55)]">
          <div className="rounded-2xl border border-[var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-ink)]">
                <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" aria-hidden />
                {primaryLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                <span className="h-2 w-2 rounded-full bg-[color:var(--border)]" aria-hidden />
                {secondaryLabel}
              </span>
            </div>

            <ServiceAreaMap
              className="mt-4"
              title={mapTitle}
              caption={mapCaption}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

