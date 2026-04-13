"use client";

import { useEffect, useMemo, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const options: Array<{
  value: Theme;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "system", label: "Auto", Icon: Laptop },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
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
                ? "bg-gradient-to-r from-cyan-500/25 to-fuchsia-500/25 text-[var(--foreground)] shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                : "text-[var(--muted)] hover:bg-white/10 hover:text-[var(--foreground)]"
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

