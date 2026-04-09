/** Allowed visit window values (labels come from i18n on the client). */

export const BOOKING_SLOT_VALUES = ["09-12", "12-15", "15-18"] as const;
export type BookingSlotValue = (typeof BOOKING_SLOT_VALUES)[number];

export function isBookingSlot(v: string): v is BookingSlotValue {
  return BOOKING_SLOT_VALUES.includes(v as BookingSlotValue);
}

/** Human-readable label for Telegram (language-neutral). */
export const BOOKING_SLOT_LABEL: Record<BookingSlotValue, string> = {
  "09-12": "09:00–12:00",
  "12-15": "12:00–15:00",
  "15-18": "15:00–18:00",
};
