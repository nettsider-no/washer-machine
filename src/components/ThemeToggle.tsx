"use client";

import { useEffect, useMemo, useState } from "react";
import { LaptopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const options: Array<{
  value: Theme;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "system", label: "Auto", Icon: LaptopIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
];

function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initial = document.documentElement.dataset.theme;
    if (isTheme(initial)) setTheme(initial);
  }, []);

  const label = useMemo(
    () => options.find((o) => o.value === theme)?.label ?? "Auto",
    [theme]
  );

  const applyTheme = (next: Theme) => {
    document.documentElement.dataset.theme = next;
  };

  const persist = async (next: Theme) => {
    setSaving(true);
    try {
      await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      });
    } finally {
      setSaving(false);
    }
  };

  const onSelect = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
    void persist(next);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-[var(--border)] bg-[color:var(--surface)] p-1 backdrop-blur-md",
        className
      )}
      role="group"
      aria-label={`Theme: ${label}`}
      aria-busy={saving}
    >
      {options.map(({ value, label: optionLabel, Icon }) => {
        const active = value === theme;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 sm:px-3",
              active
                ? "bg-[color:var(--accent-bg)] text-[var(--foreground)] shadow-[0_16px_48px_-28px_rgba(2,6,23,0.55)]"
                : "text-[var(--muted)] hover:bg-[color:var(--surface-hover)] hover:text-[var(--foreground)]"
            )}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{optionLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

