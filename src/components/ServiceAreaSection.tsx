import { DrawingPinIcon, GlobeIcon, LapTimerIcon, SewingPinFilledIcon } from "@radix-ui/react-icons";

type Props = {
  title: string;
  lead: string;
  bullets: string[];
  mapCaption: string;
  primaryLabel: string;
  secondaryLabel: string;
};

export function ServiceAreaSection({
  title,
  lead,
  bullets,
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
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {mapCaption}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-ink)]">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" aria-hidden />
                    {primaryLabel}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--border)]" aria-hidden />
                    {secondaryLabel}
                  </span>
                </div>
              </div>
            </div>

            <svg
              className="mt-4 h-[260px] w-full"
              viewBox="0 0 420 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={mapCaption}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="areaGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(256 126) rotate(90) scale(84 120)">
                  <stop stopColor="var(--accent)" stopOpacity="0.22" />
                  <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Stylized Norway silhouette (approximate) */}
              <path
                d="M184 18c22 6 30 22 44 34 18 15 40 12 56 26 14 12 18 35 10 52-7 16-1 26 11 38 10 10 10 28-1 38-11 10-16 21-13 36 3 15-4 32-19 39-17 8-42 2-58 12-16 10-22 24-46 22-22-2-24-22-34-38-8-13-24-19-34-31-10-12-6-28 2-41 8-13 1-25-10-35-13-12-20-29-11-44 10-16 30-15 43-26 12-10 13-28 26-38 10-7 22-7 34-4Z"
                fill="transparent"
                stroke="var(--hero-line)"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              {/* Service region (Oslo + surrounding) */}
              <ellipse cx="260" cy="130" rx="74" ry="52" fill="url(#areaGlow)" />
              <ellipse
                cx="260"
                cy="130"
                rx="68"
                ry="46"
                fill="transparent"
                stroke="var(--accent)"
                strokeOpacity="0.32"
                strokeWidth="2"
              />

              {/* Oslo marker */}
              <circle cx="274" cy="144" r="5.5" fill="var(--accent)" />
              <circle cx="274" cy="144" r="11" fill="transparent" stroke="var(--accent)" strokeOpacity="0.25" strokeWidth="2" />

              {/* Label line */}
              <path d="M280 140 L328 122" stroke="var(--hero-line)" strokeWidth="1.2" strokeLinecap="round" />
              <rect
                x="330"
                y="108"
                width="78"
                height="26"
                rx="13"
                fill="var(--surface-strong)"
                stroke="var(--border)"
              />
              <text
                x="369"
                y="126"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="var(--foreground)"
                style={{ letterSpacing: "-0.01em" }}
              >
                Oslo
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

