import { getPool } from "@/lib/db";
import type { OrderRow, OrderStatus } from "@/lib/orders";

function mapRow(r: Record<string, unknown>): OrderRow {
  return {
    id: String(r.id),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    status: r.status as OrderStatus,
    locale: r.locale != null ? String(r.locale) : null,
    name: String(r.name),
    phone: String(r.phone),
    address: r.address != null ? String(r.address) : null,
    brand: r.brand != null ? String(r.brand) : null,
    model: r.model != null ? String(r.model) : null,
    issue: String(r.issue),
    error_code: r.error_code != null ? String(r.error_code) : null,
    preferred_window: (r.preferred_window as OrderRow["preferred_window"]) ?? null,
    preferred_comment:
      r.preferred_comment != null ? String(r.preferred_comment) : null,
    visit_date: r.visit_date != null ? String(r.visit_date) : null,
    visit_time: r.visit_time != null ? String(r.visit_time) : null,
    visit_comment: r.visit_comment != null ? String(r.visit_comment) : null,
    tg_chat_id: r.tg_chat_id != null ? String(r.tg_chat_id) : null,
    tg_message_id:
      r.tg_message_id != null ? Number(r.tg_message_id) : null,
  };
}

export async function insertOrder(params: {
  status: OrderStatus;
  locale: string;
  name: string;
  phone: string;
  address: string | null;
  brand: string | null;
  model: string | null;
  issue: string;
  error_code: string | null;
  preferred_window: "today" | "tomorrow" | "soon" | null;
  preferred_comment: string | null;
  visit_date: string | null;
  visit_time: string | null;
}): Promise<OrderRow> {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO orders (
      status, locale, name, phone, address, brand, model, issue, error_code,
      preferred_window, preferred_comment, visit_date, visit_time
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      params.status,
      params.locale,
      params.name,
      params.phone,
      params.address,
      params.brand,
      params.model,
      params.issue,
      params.error_code,
      params.preferred_window,
      params.preferred_comment,
      params.visit_date,
      params.visit_time,
    ]
  );
  if (!rows[0]) throw new Error("insert returned no row");
  return mapRow(rows[0] as Record<string, unknown>);
}

export async function updateOrderTelegramMeta(
  id: string,
  tg_chat_id: string,
  tg_message_id: number | null
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE orders SET tg_chat_id = $1, tg_message_id = $2, updated_at = now() WHERE id = $3`,
    [tg_chat_id, tg_message_id, id]
  );
}

export async function loadOrderById(id: string): Promise<OrderRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [id]);
  if (!rows[0]) return null;
  return mapRow(rows[0] as Record<string, unknown>);
}

type Patchable = Partial<
  Pick<
    OrderRow,
    | "status"
    | "visit_date"
    | "visit_time"
    | "visit_comment"
    | "tg_chat_id"
    | "tg_message_id"
  >
>;

export async function patchOrder(id: string, patch: Patchable): Promise<OrderRow> {
  const pool = getPool();
  const keys = Object.keys(patch).filter(
    (k) => patch[k as keyof Patchable] !== undefined
  ) as (keyof Patchable)[];
  if (!keys.length) {
    const cur = await loadOrderById(id);
    if (!cur) throw new Error("order not found");
    return cur;
  }
  const cols: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  for (const k of keys) {
    cols.push(`${snake(k)} = $${i++}`);
    vals.push(patch[k]);
  }
  cols.push(`updated_at = now()`);
  vals.push(id);
  const sql = `UPDATE orders SET ${cols.join(", ")} WHERE id = $${i} RETURNING *`;
  const { rows } = await pool.query(sql, vals);
  if (!rows[0]) throw new Error("patch returned no row");
  return mapRow(rows[0] as Record<string, unknown>);
}

function snake(k: keyof Patchable): string {
  const m: Record<string, string> = {
    status: "status",
    visit_date: "visit_date",
    visit_time: "visit_time",
    visit_comment: "visit_comment",
    tg_chat_id: "tg_chat_id",
    tg_message_id: "tg_message_id",
  };
  return m[String(k)] ?? String(k);
}

export async function listActiveOrders(): Promise<OrderRow[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM orders
     WHERE status IN ('new', 'in_progress')
     ORDER BY visit_date ASC NULLS LAST, visit_time ASC NULLS LAST, created_at DESC`
  );
  return rows.map((r) => mapRow(r as Record<string, unknown>));
}

export async function upsertTgSession(
  userId: number,
  session: unknown,
  expiresAt: Date
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO tg_sessions (user_id, session, updated_at, expires_at)
     VALUES ($1, $2::jsonb, now(), $3)
     ON CONFLICT (user_id) DO UPDATE SET
       session = EXCLUDED.session,
       updated_at = EXCLUDED.updated_at,
       expires_at = EXCLUDED.expires_at`,
    [userId, JSON.stringify(session), expiresAt.toISOString()]
  );
}

export async function getTgSession(
  userId: number
): Promise<{ session: unknown; expires_at: string } | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT session, expires_at FROM tg_sessions WHERE user_id = $1`,
    [userId]
  );
  const row = rows[0] as { session: unknown; expires_at: string } | undefined;
  if (!row) return null;
  const exp = Date.parse(row.expires_at);
  if (!exp || Date.now() > exp) return null;
  return row;
}

export async function deleteTgSession(userId: number): Promise<void> {
  const pool = getPool();
  await pool.query(`DELETE FROM tg_sessions WHERE user_id = $1`, [userId]);
}
