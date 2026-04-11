"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IMaskInput } from "react-imask";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Paperclip, ShieldCheck, X } from "lucide-react";

import { useLocale } from "./LocaleProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const BRANDS = [
  "Samsung",
  "LG",
  "Bosch",
  "Siemens",
  "Electrolux",
  "AEG",
  "Whirlpool",
  "Indesit",
  "Ariston",
  "Beko",
  "Zanussi",
  "Miele",
] as const;

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

type PublicSlot = { id: string; label: string };

export function RepairRequestForm() {
  const { t, locale } = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [availSlots, setAvailSlots] = useState<PublicSlot[] | null>(null);
  const [submitState, setSubmitState] = useState<
    "idle" | "sending" | "error"
  >("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const useSlots = availSlots !== null && availSlots.length > 0;

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    fetch(`/api/availability?locale=${encodeURIComponent(locale)}`)
      .then((r) => r.json())
      .then((j: { slots?: PublicSlot[] }) => {
        setAvailSlots(Array.isArray(j.slots) ? j.slots : []);
      })
      .catch(() => setAvailSlots([]));
  }, [locale]);

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(1, t.reqValidationRequired),
          phone: z
            .string()
            .trim()
            .min(1, t.reqValidationRequired)
            .refine((v) => {
              const d = digitsOnly(v);
              return d.length === 10 && d.startsWith("47");
            }, t.reqValidationPhone),
          address: z.string().trim().optional(),
          brand: z.string().trim().optional(),
          brandOther: z.string().trim().optional(),
          model: z.string().trim().optional(),
          issue: z.string().trim().min(5, t.reqValidationRequired),
          errorCode: z.string().trim().optional(),
          time: z.enum(["today", "tomorrow", "soon"]).optional(),
          slotKey: z.string().optional(),
          timeComment: z.string().trim().optional(),
          website: z.string().optional(),
          startedAt: z.string().optional(),
        })
        .superRefine((data, ctx) => {
          if (useSlots) {
            if (!data.slotKey?.trim()) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t.reqValidationRequired,
                path: ["slotKey"],
              });
            }
          } else {
            const tm = data.time;
            if (tm !== "today" && tm !== "tomorrow" && tm !== "soon") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t.reqValidationRequired,
                path: ["time"],
              });
            }
          }
        }),
    [t, useSlots]
  );

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      brand: "",
      brandOther: "",
      model: "",
      issue: "",
      errorCode: "",
      time: "soon",
      slotKey: "",
      timeComment: "",
      website: "",
      startedAt: "",
    },
    mode: "onBlur",
  });

  const brand = form.watch("brand");

  const canSubmit = submitState !== "sending";

  function onPickFiles(next: FileList | null) {
    if (!next) return;
    const arr = Array.from(next);
    const merged = [...files, ...arr].slice(0, 3);
    setFiles(merged);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addHint(hint: string) {
    const current = (form.getValues("issue") ?? "").trim();
    if (!current) {
      form.setValue("issue", hint, { shouldDirty: true, shouldTouch: true });
      return;
    }
    const sep = current.endsWith(".") || current.endsWith("!") ? " " : ". ";
    form.setValue("issue", `${current}${sep}${hint}`, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  async function onSubmit(values: FormValues) {
    if (files.length > 3) {
      setServerError(t.reqValidationMedia);
      setSubmitState("error");
      return;
    }

    if (values.website?.trim()) {
      // Honeypot: bots.
      setSuccessOpen(true);
      form.reset();
      setFiles([]);
      return;
    }

    setSubmitState("sending");
    setServerError(null);
    try {
      const fd = new FormData();
      fd.set("locale", locale);
      fd.set("name", values.name.trim());
      fd.set("phone", values.phone.trim());
      fd.set("address", values.address?.trim() ?? "");
      fd.set("brand", values.brand?.trim() ?? "");
      fd.set("brandOther", values.brandOther?.trim() ?? "");
      fd.set("model", values.model?.trim() ?? "");
      fd.set("issue", values.issue.trim());
      fd.set("errorCode", values.errorCode?.trim() ?? "");
      if (useSlots && values.slotKey?.trim()) {
        fd.set("slotKey", values.slotKey.trim());
        fd.set("time", "");
      } else {
        fd.set("slotKey", "");
        fd.set("time", values.time ?? "soon");
      }
      fd.set("timeComment", values.timeComment?.trim() ?? "");
      fd.set("startedAt", String(startedAtRef.current));
      for (const f of files) fd.append("media", f, f.name);

      const res = await fetch("/api/repair-request", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        detail?: string;
        code?: string;
      };
      if (!res.ok || !json.ok) {
        const extra =
          json.detail || json.code
            ? ` (${[json.code, json.detail].filter(Boolean).join(": ")})`
            : "";
        setServerError((json.error || t.reqError) + extra);
        setSubmitState("error");
        return;
      }

      form.reset();
      setFiles([]);
      startedAtRef.current = Date.now();
      setSuccessOpen(true);
      setSubmitState("idle");
    } catch {
      setServerError(t.reqError);
      setSubmitState("error");
    }
  }

  return (
    <>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10">
                <CheckCircle2 className="h-6 w-6 text-cyan-200" />
              </div>
              <div className="min-w-0">
                <DialogTitle>{t.reqSuccessTitle}</DialogTitle>
                <DialogDescription className="mt-1">
                  {t.reqSuccessText}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setSuccessOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>{t.requestFormTitle}</CardTitle>
          <CardDescription>{t.requestFormHint}</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            key={availSlots === null ? "av-loading" : useSlots ? "av-slot" : "av-legacy"}
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5"
            noValidate
          >
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
            {...form.register("website")}
          />
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
            value={String(startedAtRef.current)}
            {...form.register("startedAt")}
            readOnly
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="rr-name">{t.reqName} *</Label>
              <Input
                id="rr-name"
                autoComplete="name"
                {...form.register("name")}
              />
              {form.formState.errors.name?.message && (
                <p className="mt-1 text-xs text-amber-300">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="rr-phone">{t.reqPhone} *</Label>
              <IMaskInput
                id="rr-phone"
                mask="+{47} 00 00 00 00"
                lazy={false}
                overwrite
                inputMode="tel"
                autoComplete="tel"
                className={cn(
                  "flex h-11 w-full rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                )}
                placeholder="+47 000 00 000"
                value={form.watch("phone")}
                onAccept={(v) =>
                  form.setValue("phone", String(v), { shouldDirty: true })
                }
              />
              {form.formState.errors.phone?.message && (
                <p className="mt-1 text-xs text-amber-300">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="rr-address">{t.reqAddress}</Label>
            <Input
              id="rr-address"
              autoComplete="street-address"
              {...form.register("address")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t.reqBrand}</Label>
              <Select
                value={brand || ""}
                onValueChange={(v) => form.setValue("brand", v, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.reqBrandPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                  <Separator className="my-2" />
                  <SelectItem value="other">{t.reqBrandOther}</SelectItem>
                  <SelectItem value="unknown">{t.reqBrandUnknown}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rr-model">{t.reqModel}</Label>
              <Input id="rr-model" {...form.register("model")} />
            </div>
          </div>

          {brand === "other" && (
            <div>
              <Label htmlFor="rr-brand-other">{t.reqBrandOther}</Label>
              <Input id="rr-brand-other" {...form.register("brandOther")} />
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <Label htmlFor="rr-issue">{t.reqIssue} *</Label>
              <span className="text-xs text-zinc-500">{t.reqIssueHintsLabel}</span>
            </div>
            <Textarea
              id="rr-issue"
              placeholder={t.reqIssuePlaceholder}
              rows={5}
              {...form.register("issue")}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {t.reqIssueHints.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => addHint(h)}
                  className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:bg-white/5"
                >
                  {h}
                </button>
              ))}
            </div>
            {form.formState.errors.issue?.message && (
              <p className="mt-2 text-xs text-amber-300">
                {form.formState.errors.issue.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="rr-error">{t.reqErrorCode}</Label>
              <Input id="rr-error" {...form.register("errorCode")} />
            </div>

            <div>
              <Label>{useSlots ? `${t.reqVisitSlot} *` : `${t.reqTime} *`}</Label>
              {availSlots === null ? (
                <p className="mt-2 text-sm text-zinc-500">…</p>
              ) : useSlots ? (
                <>
                  <Select
                    value={form.watch("slotKey") || undefined}
                    onValueChange={(v) =>
                      form.setValue("slotKey", v, { shouldDirty: true, shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.reqVisitSlotPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {availSlots.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1.5 text-xs text-zinc-500">{t.reqTimezoneNote}</p>
                  {form.formState.errors.slotKey?.message && (
                    <p className="mt-1 text-xs text-amber-300">
                      {form.formState.errors.slotKey.message}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Select
                    value={form.watch("time")}
                    onValueChange={(v) =>
                      form.setValue("time", v as NonNullable<FormValues["time"]>, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.reqTimePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">{t.reqTimeToday}</SelectItem>
                      <SelectItem value="tomorrow">{t.reqTimeTomorrow}</SelectItem>
                      <SelectItem value="soon">{t.reqTimeSoon}</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.time?.message && (
                    <p className="mt-1 text-xs text-amber-300">
                      {form.formState.errors.time.message}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="rr-time-comment">{t.reqTimeComment}</Label>
            <Input
              id="rr-time-comment"
              placeholder={t.reqTimeCommentPlaceholder}
              {...form.register("timeComment")}
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <Label htmlFor="rr-media">{t.reqMedia}</Label>
              <span className="text-xs text-zinc-500">{t.reqMediaHint}</span>
            </div>

            <div className="mt-2 grid gap-3">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="rr-media"
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/5",
                    !canSubmit && "pointer-events-none opacity-60"
                  )}
                >
                  <Paperclip className="h-4 w-4 text-zinc-300" />
                  <span>+ {t.reqMedia}</span>
                </label>
                <input
                  id="rr-media"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    onPickFiles(e.currentTarget.files);
                    e.currentTarget.value = "";
                  }}
                />
                {files.length > 0 && (
                  <Badge variant="cyan">
                    {files.length} / 3
                  </Badge>
                )}
              </div>

              {files.length > 0 && (
                <div className="grid gap-2">
                  {files.map((f, i) => (
                    <div
                      key={`${f.name}-${f.size}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-zinc-100">{f.name}</p>
                        <p className="text-xs text-zinc-500">
                          {Math.round(f.size / 1024)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {submitState === "error" && (
            <p className="text-sm text-amber-300">{serverError || t.reqError}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-cyan-200/80" />
              <span>* {t.reqValidationRequired}</span>
            </p>
            <Button type="submit" disabled={!canSubmit}>
              {submitState === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.reqSending}
                </>
              ) : (
                t.reqSubmit
              )}
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

