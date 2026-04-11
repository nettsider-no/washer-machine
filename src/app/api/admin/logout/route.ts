import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const secure = process.env.NODE_ENV === "production";
  const cookie = `${getAdminCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}
