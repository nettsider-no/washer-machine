import { z } from "zod";

export const adminOrderPatchBodySchema = z.object({
  action: z.enum(["cancel", "cancel_and_hide_slot"]),
});
