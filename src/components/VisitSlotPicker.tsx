"use client";

import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import { cn } from "@/lib/utils";
import { nextNDatesOslo, OSLO, parseSlotId, SLOT_DAYS_AHEAD } from "@/lib/slotUtils";

export type VisitSlotItem = { id: string; label: string };

type Props = {
  slots: VisitSlotItem[];
  value: string;
  onChange: (slotId: string) => void;
  locale: string;
  pickDateLabel: string;
  pickTimeLabel: string;
};

function groupByDate(items: VisitSlotItem[]): Map<string, VisitSlotItem[]> {
  const m = new Map<string, VisitSlotItem[]>();
  for (const s of items) {
    const p = parseSlotId(s.id);
    if (!p) continue;
    const list = m.get(p.d) ?? [];
    list.push(s);
    m.set(p.d, list);
  }
  for (const [, list] of m) {
    list.sort((a, b) => a.id.localeCompare(b.id));
  }
  return m;
}

function luxonLocale(locale: string): string {
  if (locale === "no") return "nb";
  if (locale === "ru") return "ru";
  return "en";
}

export function VisitSlotPicker({
  slots,
  value,
  onChange,
  locale,
  pickDateLabel,
  pickTimeLabel,
}: Props) {
  const dates = useMemo(() => nextNDatesOslo(SLOT_DAYS_AHEAD), []);
  const byDate = useMemo(() => groupByDate(slots), [slots]);

  const [pickedDate, setPickedDate] = useState<string | null>(
    () => parseSlotId(value)?.d ?? null
  );

  const loc = luxonLocale(locale);

  const timesForDay =
    pickedDate && byDate.has(pickedDate) ? byDate.get(pickedDate)! : [];

  return (
    <div className="grid gap-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {pickDateLabel}
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {dates.map((d) => {
            const hasSlots = (byDate.get(d)?.length ?? 0) > 0;
            const dt = DateTime.fromISO(`${d}T12:00:00`, { zone: OSLO }).setLocale(loc);
            const wk = dt.toFormat("EEE");
            const num = dt.toFormat("d");
            const isPicked = pickedDate === d;
            return (
              <button
                key={d}
                type="button"
                disabled={!hasSlots}
                onClick={() => {
                  if (!hasSlots) return;
                  setPickedDate(d);
                  const cur = parseSlotId(value);
                  if (cur?.d !== d) {
                    onChange("");
                  }
                }}
                className={cn(
                  "flex min-h-[4.25rem] flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition",
                  !hasSlots &&
                    "cursor-not-allowed border-[var(--border)] bg-[color:var(--surface)] opacity-45",
                  hasSlots &&
                    !isPicked &&
                    "border-[var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--accent-border)] hover:bg-[color:var(--surface-hover)]",
                  hasSlots &&
                    isPicked &&
                    "border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] shadow-[0_20px_60px_-45px_rgba(2,6,23,0.55)]"
                )}
              >
                <span className="text-[10px] font-medium uppercase leading-tight text-[var(--muted)]">
                  {wk}
                </span>
                <span className="text-lg font-bold leading-tight text-[var(--foreground)]">
                  {num}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {pickedDate && timesForDay.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {pickTimeLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {timesForDay.map((s) => {
              const p = parseSlotId(s.id);
              const label =
                p != null
                  ? `${String(p.h).padStart(2, "0")}:00`
                  : s.label.split(",").pop()?.trim() ?? s.label;
              const active = value === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChange(s.id)}
                  className={cn(
                    "min-w-[4.5rem] rounded-lg border px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] text-[color:var(--accent-ink)]"
                      : "border-[var(--border)] bg-[color:var(--surface)] text-[var(--foreground)] hover:border-[color:var(--accent-border)]"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pickedDate && timesForDay.length === 0 && (
        <p className="text-sm text-[color:var(--warning)]">
          {locale === "ru"
            ? "На этот день слотов уже нет — выберите другой день."
            : locale === "no"
              ? "Ingen ledige timer denne dagen — velg en annen dag."
              : "No slots left on this day — pick another date."}
        </p>
      )}
    </div>
  );
}
