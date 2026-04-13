"use client";

import { useState } from "react";
import { useLocale } from "./LocaleProvider";
import { contactBodySchema } from "@/lib/validation/contact";

export function ContactForm() {
  const { t } = useLocale();
  const [status, setStatus] = useState<
    "idle" | "sending" | "ok" | "err" | "validate"
  >("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactBodySchema.safeParse({
      name,
      phone,
      email: email.trim() || undefined,
      city: city.trim() || undefined,
      message,
      website: website || undefined,
    });
    if (!parsed.success) {
      setStatus("validate");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email ?? "",
          city: parsed.data.city ?? "",
          message: parsed.data.message,
          website: parsed.data.website ?? "",
        }),
      });
      if (!res.ok) {
        setStatus("err");
        return;
      }
      setStatus("ok");
      setName("");
      setPhone("");
      setEmail("");
      setCity("");
      setMessage("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid max-w-xl gap-4 rounded-2xl border border-[var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.22)] backdrop-blur-sm"
    >
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />
      <div>
        <label className="mb-1 block text-sm text-[var(--muted)]" htmlFor="cf-name">
          {t.formName} *
        </label>
        <input
          id="cf-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[color:var(--field)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-cyan-500/40 placeholder:text-[color:var(--field-placeholder)] focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--muted)]" htmlFor="cf-phone">
          {t.formPhone} *
        </label>
        <input
          id="cf-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[color:var(--field)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--muted)]" htmlFor="cf-email">
          {t.formEmail}
        </label>
        <input
          id="cf-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[color:var(--field)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--muted)]" htmlFor="cf-city">
          {t.formCity}
        </label>
        <input
          id="cf-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[color:var(--field)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      <div>
        <label
          className="mb-1 block text-sm text-[var(--muted)]"
          htmlFor="cf-message"
        >
          {t.formMessage} *
        </label>
        <textarea
          id="cf-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[color:var(--field)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      {status === "validate" && (
        <p className="text-sm text-amber-400">{t.formRequired}</p>
      )}
      {status === "err" && (
        <p className="text-sm text-amber-400">{t.formError}</p>
      )}
      {status === "ok" && (
        <p className="text-sm text-cyan-300">{t.formSuccess}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-[0_0_28px_rgba(34,211,238,0.25)] transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? t.formSending : t.formSubmit}
      </button>
    </form>
  );
}
