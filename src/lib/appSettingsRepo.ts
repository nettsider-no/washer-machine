import { getPool } from "@/lib/db";
import type { SlotDef } from "@/lib/slotUtils";

const KEY = "visit_availability";

export async function getVisitSlotsFromDb(): Promise<SlotDef[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT value FROM app_settings WHERE key = $1`,
    [KEY]
  );
  const row = rows[0] as { value: unknown } | undefined;
  if (!row?.value) return [];
  const v = row.value as { slots?: unknown };
  if (!Array.isArray(v.slots)) return [];
  const out: SlotDef[] = [];
  for (const item of v.slots) {
    if (
      item &&
      typeof item === "object" &&
      "d" in item &&
      "h" in item &&
      typeof (item as { d: unknown }).d === "string" &&
      typeof (item as { h: unknown }).h === "number"
    ) {
      out.push({ d: (item as SlotDef).d, h: Math.round((item as SlotDef).h) });
    }
  }
  return out;
}

export async function setVisitSlotsInDb(slots: SlotDef[]): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = EXCLUDED.updated_at`,
    [KEY, JSON.stringify({ slots })]
  );
}
