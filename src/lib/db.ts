import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;

export function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim();
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
