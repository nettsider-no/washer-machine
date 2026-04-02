"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type Locale,
  LOCALES,
  isLocale,
  messages,
  type Messages,
} from "@/lib/i18n";

const STORAGE_KEY = "wash_locale";

type Ctx = {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isLocale(stored) && stored !== initialLocale) {
        setLocaleState(stored);
      }
    } catch {
      /* ignore */
    }
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    void fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    }).catch(() => {});
    if (typeof document !== "undefined") {
      document.documentElement.lang = next === "no" ? "no" : next;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "no" ? "no" : locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      t: messages[locale],
      setLocale,
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export { LOCALES, type Locale };
