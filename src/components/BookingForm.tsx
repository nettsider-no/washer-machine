"use client";

import { useEffect, useState } from "react";
import { addDaysYmd, todayYmdOslo } from "@/lib/date-oslo";
import { useLocale } from "./LocaleProvider";

export function BookingForm() {
  const { t } = useLocale();
  const [bounds, setBounds] = useState<{ min: string; max: string } | null>(
    null
  );
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("09-12");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "ok" | "err" | "validate"
  >("idle");

  useEffect(() => {
    const min = todayYmdOslo();
    const max = addDaysYmd(min, 60);
    if (max) {
      setBounds({ min, max });
      setDate(min);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date || !slot) {
      setStatus("validate");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          note: note.trim(),
          date,
          slot,
          website,
        }),
      });
      if (!res.ok) {
        setStatus("err");
        return;
      }
      setStatus("ok");
      setName("");
      setPhone("");
      setAddress("");
      setNote("");
      if (bounds) setDate(bounds.min);
      setSlot(t.bookingSlots[0]?.value ?? "09-12");
    } catch {
      setStatus("err");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid max-w-xl gap-4 rounded-2xl border border-white/10 bg-black/25 p-6 text-left shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm"
    >
      <p className="text-xs leading-relaxed text-zinc-500">
        {t.bookingDisclaimer}
      </p>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1 block text-sm text-zinc-400"
            htmlFor="bk-date"
          >
            {t.bookingDate} *
          </label>
          <input
            id="bk-date"
            type="date"
            required
            disabled={!bounds}
            min={bounds?.min}
            max={bounds?.max}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2 disabled:opacity-50"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-zinc-400"
            htmlFor="bk-slot"
          >
            {t.bookingSlot} *
          </label>
          <select
            id="bk-slot"
            required
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
          >
            {t.bookingSlots.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor="bk-name">
          {t.formName} *
        </label>
        <input
          id="bk-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor="bk-phone">
          {t.formPhone} *
        </label>
        <input
          id="bk-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor="bk-addr">
          {t.bookingAddress}
        </label>
        <input
          id="bk-addr"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor="bk-note">
          {t.bookingNote}
        </label>
        <textarea
          id="bk-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full resize-y rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 focus:border-cyan-500/50 focus:ring-2"
        />
      </div>
      {status === "validate" && (
        <p className="text-sm text-amber-400">{t.bookingRequired}</p>
      )}
      {status === "err" && (
        <p className="text-sm text-amber-400">{t.bookingError}</p>
      )}
      {status === "ok" && (
        <p className="text-sm text-cyan-300">{t.bookingSuccess}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending" || !bounds}
        className="rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-3 font-semibold text-white shadow-[0_0_28px_rgba(16,185,129,0.2)] transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? t.bookingSending : t.bookingSubmit}
      </button>
    </form>
  );
}
