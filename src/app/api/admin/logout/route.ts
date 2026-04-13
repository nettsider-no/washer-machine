import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secureFromRequest(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto === "https") return true;
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export async function POST(request: Request) {
  const secure = process.env.NODE_ENV === "production" || secureFromRequest(request);
  const cookie = `${getAdminCookieName()}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Priority=High${secure ? "; Secure" : ""}`;
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}
