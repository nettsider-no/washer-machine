import { z } from "zod";

/** Публичная форма контакта — лимиты длины против DoS и переполнения Telegram. */
export const contactBodySchema = z
  .object({
    website: z.string().max(256).optional(),
    name: z.string().trim().min(1).max(200),
    phone: z.string().trim().min(1).max(40),
    email: z.string().trim().max(320).optional(),
    city: z.string().trim().max(200).optional(),
    message: z.string().trim().min(1).max(8000),
  })
  .refine(
    (d) => {
      const e = d.email?.trim();
      if (!e) return true;
      return z.string().email().safeParse(e).success;
    },
    { message: "Invalid email", path: ["email"] }
  );

export type ContactBody = z.infer<typeof contactBodySchema>;
