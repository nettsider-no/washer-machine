import { NextResponse } from "next/server";
import { readAdminCookie } from "@/lib/adminAuth";
import { listRecentOrdersForAdmin } from "@/lib/orderRepo";
import { visitFieldsToSlotKey } from "@/lib/slotUtils";
import type { OrderRow } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serialize(o: OrderRow) {
  return {
    id: o.id,
    name: o.name,
    phone: o.phone,
    status: o.status,
    visit_date: o.visit_date,
    visit_time: o.visit_time,
    preferred_window: o.preferred_window,
    created_at: o.created_at,
    slotKey: visitFieldsToSlotKey(o.visit_date, o.visit_time),
  };
}

export async function GET(request: Request) {
  if (!readAdminCookie(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const orders = await listRecentOrdersForAdmin();
    return NextResponse.json({
      ok: true,
      orders: orders.map(serialize),
    });
  } catch (e) {
    console.error("[api/admin/orders GET]", e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
