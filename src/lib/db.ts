import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;

export function getDatabaseUrl(): string {
  const direct =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim();
  if (direct) return direct;

  // Vercel Storage sometimes injects project-scoped vars like: washermachine_DATABASE_URL
  const scoped = Object.entries(process.env).find(
    ([k, v]) => k.endsWith("_DATABASE_URL") && typeof v === "string" && v.trim()
  )?.[1];
  const url = scoped?.trim();
  if (!url) {
    throw new Error(
      "Missing DATABASE_URL (or POSTGRES_URL). Add Neon via Vercel Storage or paste the connection string."
    );
  }
  return url;
}

/** Single shared pool per server instance (OK on Vercel Node serverless). */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return pool;
}
