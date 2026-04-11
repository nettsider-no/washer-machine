-- Run once in Neon: один активный заказ на слот (visit_date + visit_time).

create unique index if not exists orders_active_visit_slot_unique
  on public.orders (visit_date, visit_time)
  where status in ('new', 'in_progress')
    and visit_date is not null
    and visit_time is not null;
