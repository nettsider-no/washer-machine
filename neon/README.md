# Neon (Vercel)

1. In Vercel: **Storage → Create → Neon** (or connect existing). Vercel adds **`DATABASE_URL`** (sometimes also `POSTGRES_URL`) to the project.
2. Open the Neon dashboard → **SQL Editor** → paste and run **`schema.sql`** from this folder.
3. Redeploy the site.
4. Remove old Supabase env vars from Vercel if you had them (`SUPABASE_*`).

Local dev: copy `DATABASE_URL` from Vercel/Neon into `site/.env`.
