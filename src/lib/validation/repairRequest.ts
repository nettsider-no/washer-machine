import { z } from "zod";

const phoneDigits = z
  .string()
  .trim()
  .refine((v) => {
    const d = v.replace(/\D/g, "");
    return d.length === 10 && d.startsWith("47");
  }, "Invalid phone");

export const repairRequestFieldsSchema = z
  .object({
    website: z.string().max(256).optional(),
    startedAt: z.string().trim().optional(),
    locale: z.string().trim().max(16).optional(),
    name: z.string().trim().min(2).max(200),
    phone: phoneDigits,
    address: z.string().trim().max(500).optional(),
    brand: z.string().trim().max(120).optional(),
    brandOther: z.string().trim().max(120).optional(),
    model: z.string().trim().max(200).optional(),
    issue: z.string().trim().min(5).max(8000),
    errorCode: z.string().trim().max(120).optional(),
    time: z.enum(["today", "tomorrow", "soon"]).optional(),
    slotKey: z.string().trim().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    const hasSlot = Boolean(data.slotKey?.trim());
    if (hasSlot) return;
    const tm = data.time;
    if (tm !== "today" && tm !== "tomorrow" && tm !== "soon") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Missing time preference",
        path: ["time"],
      });
    }
  });

export type RepairRequestFields = z.infer<typeof repairRequestFieldsSchema>;
