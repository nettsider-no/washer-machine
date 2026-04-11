import { NextResponse } from "next/server";
import { readAdminCookie } from "@/lib/adminAuth";
import { getVisitSlotsFromDb, setVisitSlotsInDb } from "@/lib/appSettingsRepo";
import { loadOrderById, patchOrder } from "@/lib/orderRepo";
import { parseSlotId, visitFieldsToSlotKey } from "@/lib/slotUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { action?: string };

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!readAdminCookie(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const action = body.action?.trim();
  if (action !== "cancel" && action !== "cancel_and_hide_slot") {
    return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
  }

  try {
    const order = await loadOrderById(id);
    if (!order) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    if (order.status !== "new" && order.status !== "in_progress") {
      return NextResponse.json(
        { ok: false, error: "not_active", status: order.status },
        { status: 400 }
      );
    }

    const slotKey = visitFieldsToSlotKey(order.visit_date, order.visit_time);

    if (action === "cancel_and_hide_slot" && slotKey) {
      const parsed = parseSlotId(slotKey);
      if (parsed) {
        const slots = await getVisitSlotsFromDb();
        const filtered = slots.filter((s) => !(s.d === parsed.d && s.h === parsed.h));
        await setVisitSlotsInDb(filtered);
      }
    }

    const updated = await patchOrder(id, {
      status: "cancelled",
      visit_date: null,
      visit_time: null,
    });

    return NextResponse.json({
      ok: true,
      order: {
        id: updated.id,
        status: updated.status,
        visit_date: updated.visit_date,
        visit_time: updated.visit_time,
      },
      removedSlotFromSchedule: action === "cancel_and_hide_slot" && !!slotKey,
    });
  } catch (e) {
    console.error("[api/admin/orders PATCH]", e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
