"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  hourRange,
  nextNDatesOslo,
  OSLO,
  slotId,
  SLOT_DAYS_AHEAD,
  sortSlots,
  type SlotDef,
} from "@/lib/slotUtils";

type AdminOrderRow = {
  id: string;
  name: string;
  phone: string;
  status: string;
  visit_date: string | null;
  visit_time: string | null;
  preferred_window: string | null;
  created_at: string;
  slotKey: string | null;
};

export function AdminPanel() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const dates = useMemo(() => nextNDatesOslo(SLOT_DAYS_AHEAD), []);
  const hours = useMemo(() => hourRange(), []);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [booked, setBooked] = useState<Set<string>>(new Set());

  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderActionId, setOrderActionId] = useState<string | null>(null);

  const loadOrders = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setOrdersLoading(true);
    try {
      const r = await fetch("/api/admin/orders", {
        credentials: "include",
        cache: "no-store",
      });
      if (r.status === 401) {
        setOrders([]);
        return;
      }
      if (!r.ok) return;
      const j = (await r.json().catch(() => null)) as {
        ok?: boolean;
        orders?: AdminOrderRow[];
      } | null;
      if (j?.ok && Array.isArray(j.orders)) setOrders(j.orders);
    } catch {
      if (!opts?.silent) setOrders([]);
    } finally {
      if (!opts?.silent) setOrdersLoading(false);
    }
  }, []);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
        setSavedMsg(null);
      }
      try {
        const r = await fetch("/api/admin/availability", {
          credentials: "include",
          cache: "no-store",
        });
        if (r.status === 401) {
          setAuthed(false);
          setSelected(new Set());
          setBooked(new Set());
          return;
        }
        if (!r.ok) {
          return;
        }
        const j = (await r.json().catch(() => null)) as {
          ok?: boolean;
          slots?: SlotDef[];
          bookedSlotIds?: string[];
        } | null;
        if (!j?.ok) {
          return;
        }
        setAuthed(true);
        setBooked(
          new Set(Array.isArray(j.bookedSlotIds) ? j.bookedSlotIds : [])
        );
        if (!opts?.silent) {
          const next = new Set<string>();
          if (Array.isArray(j.slots)) {
            for (const s of j.slots) {
              if (s?.d && typeof s.h === "number") {
                next.add(slotId(s.d, s.h));
              }
            }
          }
          setSelected(next);
        }
        void loadOrders({ silent: true });
      } catch {
        if (!opts?.silent) setAuthed(false);
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [loadOrders]
  );

  useEffect(() => {
    void load();
  }, [load]);

  /** Брони обновляются без перезагрузки страницы (тихий опрос). */
  useEffect(() => {
    if (!authed) return;
    const id = window.setInterval(() => void load({ silent: true }), 10_000);
    return () => window.clearInterval(id);
  }, [authed, load]);

  useEffect(() => {
    if (!authed) return;
    const id = window.setInterval(() => void loadOrders({ silent: true }), 15_000);
    return () => window.clearInterval(id);
  }, [authed, loadOrders]);

  async function cancelOrder(id: string, mode: "cancel" | "cancel_and_hide_slot") {
    if (mode === "cancel_and_hide_slot") {
      const ok = window.confirm(
        "Отменить заявку и убрать этот час из расписания на сайте? Клиенты больше не смогут выбрать это время, пока вы снова не отметите час в сетке ниже и не сохраните."
      );
      if (!ok) return;
    }
    setOrderActionId(id);
    try {
      const r = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode }),
      });
      if (r.status === 401) {
        setAuthed(false);
        return;
      }
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        window.alert(j?.error === "not_active" ? "Заявка уже не активна." : "Не удалось выполнить.");
        return;
      }
      void load({ silent: true });
      void loadOrders({ silent: true });
    } catch {
      window.alert("Ошибка сети");
    } finally {
      setOrderActionId(null);
    }
  }

  function orderSlotLabel(o: AdminOrderRow): string {
    if (o.slotKey && o.visit_date) {
      const t = o.visit_time?.slice(0, 5) ?? "";
      return t ? `${o.visit_date} ${t}` : o.visit_date;
    }
    if (o.preferred_window === "today") return "Удобно: сегодня (слот не выбран)";
    if (o.preferred_window === "tomorrow") return "Удобно: завтра (слот не выбран)";
    if (o.preferred_window === "soon") return "Удобно: скоро (слот не выбран)";
    return "—";
  }

  function toggle(d: string, h: number) {
    const id = slotId(d, h);
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setSavedMsg(null);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        if (r.status === 429 || j?.error === "rate_limited") {
          setLoginError("Слишком много попыток. Подождите несколько минут.");
          return;
        }
        setLoginError("Неверный пароль");
        return;
      }
      setPassword("");
      await load();
    } catch {
      setLoginError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setSavedMsg(null);
    const slots: SlotDef[] = [];
    for (const id of selected) {
      const [d, hStr] = id.split("T");
      if (!d || hStr === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
      const hour = parseInt(hStr, 10);
      if (!Number.isFinite(hour)) continue;
      slots.push({ d, h: hour });
    }
    slots.sort(sortSlots);
    try {
      const r = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slots }),
      });
      if (r.status === 401) {
        setAuthed(false);
        return;
      }
      if (!r.ok) {
        setSavedMsg("Не удалось сохранить");
        return;
      }
      setSavedMsg("Сохранено");
      void load({ silent: true });
      void loadOrders({ silent: true });
    } catch {
      setSavedMsg("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthed(false);
    setSelected(new Set());
    setBooked(new Set());
  }

  function dayTitle(isoDate: string): string {
    return DateTime.fromISO(`${isoDate}T12:00:00`, { zone: OSLO })
      .setLocale("ru")
      .toFormat("ccc, d MMM");
  }

  if (authed === null || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-white">
          Панель: слоты выезда
        </h1>
        <p className="mb-6 text-sm text-zinc-400">
          Введите пароль из переменной <code className="text-cyan-300">ADMIN_PASSWORD</code> на
          сервере.
        </p>
        <form onSubmit={login} className="grid gap-4">
          <div>
            <Label htmlFor="adm-pw">Пароль</Label>
            <Input
              id="adm-pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          {loginError && <p className="text-sm text-amber-300">{loginError}</p>}
          <Button type="submit" disabled={loading}>
            Войти
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
            Слоты на неделю вперёд
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Часовой пояс: <b>Europe/Oslo</b> (Норвегия). Отметьте часы, когда можете принять выезд.
            На сайте клиенты увидят только эти окна.
          </p>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            В любой момент можно <b>снять</b> галочку с часа или <b>добавить</b> новые — нажмите
            «Сохранить слоты». Изменения подхватываются на сайте в течение пары секунд (у
            открытой формы). Список броней подтягивается <b>сам каждые ~10 секунд</b> — обновлять
            страницу не нужно (кнопка «Обновить» — если нужно сразу).
          </p>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            <b>Отмена в Telegram</b> («Отменить» на карточке) снимает бронь слота в базе: час снова
            доступен клиентам, если он отмечен в сетке ниже. Ниже — активные заявки: можно отменить
            из админки или отменить и сразу убрать час из публичного расписания.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void load()}>
            Обновить
          </Button>
          <Button type="button" variant="ghost" onClick={() => void logout()}>
            Выйти
          </Button>
        </div>
      </div>

      <div className="mx-auto mb-10 max-w-[720px] rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
        <h2 className="mb-2 font-semibold text-white">Активные заявки</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Новые и в работе. После отмены слот освобождается для других клиентов.
        </p>
        {ordersLoading && orders.length === 0 ? (
          <div className="flex justify-center py-6 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-zinc-500">Нет активных заявок.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-200"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="font-medium text-white">{o.name}</span>
                    <span className="text-zinc-500"> · {o.phone}</span>
                    <div className="mt-1 text-xs text-zinc-400">
                      {o.status === "new" ? "🆕 Новая" : "🔧 В работе"} · {orderSlotLabel(o)}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-600">{o.id}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={orderActionId === o.id}
                      onClick={() => void cancelOrder(o.id, "cancel")}
                    >
                      {orderActionId === o.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Отменить заявку"
                      )}
                    </Button>
                    {o.slotKey ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="border border-amber-500/35 text-amber-100 hover:bg-amber-950/35"
                        disabled={orderActionId === o.id}
                        onClick={() => void cancelOrder(o.id, "cancel_and_hide_slot")}
                      >
                        Отменить и убрать час с сайта
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        {dates.map((d) => (
          <div
            key={d}
            className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm"
          >
            <p className="mb-3 font-semibold capitalize text-cyan-200">{dayTitle(d)}</p>
            <div className="flex flex-wrap gap-2">
              {hours.map((h) => {
                const id = slotId(d, h);
                const on = selected.has(id);
                const isBooked = booked.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(d, h)}
                    className={cn(
                      "flex min-w-[4.5rem] flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-sm font-medium transition",
                      on && !isBooked && "border-cyan-400/50 bg-cyan-500/20 text-cyan-100",
                      on &&
                        isBooked &&
                        "border-amber-400/55 bg-amber-500/15 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.12)]",
                      !on &&
                        isBooked &&
                        "border-amber-500/40 bg-amber-950/30 text-amber-100/90",
                      !on && !isBooked && "border-white/10 bg-black/40 text-zinc-400 hover:border-white/20"
                    )}
                  >
                    <span>{String(h).padStart(2, "0")}:00</span>
                    {isBooked && (
                      <span className="mt-0.5 text-[9px] font-bold uppercase leading-none text-amber-200/95">
                        Занято
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение…
            </>
          ) : (
            "Сохранить слоты"
          )}
        </Button>
        {savedMsg && <span className="text-sm text-zinc-400">{savedMsg}</span>}
      </div>
    </div>
  );
}
