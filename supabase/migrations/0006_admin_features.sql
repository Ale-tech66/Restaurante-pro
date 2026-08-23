-- ============================================================
-- Restaurante Pro — 0006: Funciones de admin y gaps de la spec
-- ============================================================
-- Completa lo que falta según la especificación final:
--   1. Rol 'gerente' + permisos
--   2. Sesiones de caja (turnos: apertura, cierre, saldo)
--   3. Horarios del restaurante
--   4. Favoritos de clientes
--   5. Columnas faltantes en restaurants (horarios, logo, etc.)
-- ============================================================

-- ============================================================
-- 1. ROL GERENTE
-- ============================================================
insert into public.roles (name, description)
values ('gerente', 'Gerente: gestión operativa del restaurante')
on conflict (name) do nothing;

-- Permisos del gerente (gestión operativa, sin usuarios ni configuración global)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'gerente'
  and p.name in (
    'products.manage', 'categories.manage', 'tables.manage',
    'orders.create', 'orders.update', 'orders.cancel',
    'inventory.manage', 'discounts.manage', 'reports.view'
  )
on conflict do nothing;

-- ============================================================
-- 2. SESIONES DE CAJA (turnos)
-- ============================================================
create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'abierta',  -- abierta | cerrada
  opening_balance numeric(10,2) not null default 0,
  closing_balance numeric(10,2),
  expected_balance numeric(10,2),
  difference numeric(10,2),
  cash_sales numeric(10,2) not null default 0,
  card_sales numeric(10,2) not null default 0,
  transfer_sales numeric(10,2) not null default 0,
  tips_total numeric(10,2) not null default 0,
  discounts_total numeric(10,2) not null default 0,
  refunds_total numeric(10,2) not null default 0,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text
);

create index if not exists cash_sessions_restaurant_idx on public.cash_sessions (restaurant_id);
create index if not exists cash_sessions_user_idx on public.cash_sessions (user_id);
create index if not exists cash_sessions_status_idx on public.cash_sessions (status);

-- ============================================================
-- 3. HORARIOS DEL RESTAURANTE
-- ============================================================
create table if not exists public.restaurant_hours (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  day_of_week int not null,  -- 0=Domingo, 1=Lunes, ..., 6=Sábado
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  unique (restaurant_id, day_of_week)
);

create index if not exists restaurant_hours_restaurant_idx on public.restaurant_hours (restaurant_id);

-- ============================================================
-- 4. FAVORITOS DE CLIENTES
-- ============================================================
create table if not exists public.customer_favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create index if not exists customer_favorites_customer_idx on public.customer_favorites (customer_id);

-- ============================================================
-- 5. RLS — políticas para las tablas nuevas
-- ============================================================

-- cash_sessions
alter table public.cash_sessions enable row level security;

create policy "cash_sessions_select" on public.cash_sessions
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "cash_sessions_insert" on public.cash_sessions
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id());

create policy "cash_sessions_update" on public.cash_sessions
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

-- restaurant_hours
alter table public.restaurant_hours enable row level security;

create policy "restaurant_hours_select" on public.restaurant_hours
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "restaurant_hours_insert" on public.restaurant_hours
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "restaurant_hours_update" on public.restaurant_hours
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "restaurant_hours_delete" on public.restaurant_hours
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

-- customer_favorites (acceso público anónimo para clientes QR)
alter table public.customer_favorites enable row level security;

create policy "customer_favorites_select" on public.customer_favorites
  for select to anon, authenticated
  using (true);

create policy "customer_favorites_insert" on public.customer_favorites
  for insert to anon, authenticated
  with check (true);

create policy "customer_favorites_delete" on public.customer_favorites
  for delete to anon, authenticated
  using (true);

-- ============================================================
-- 6. REALTIME — añadir tablas nuevas
-- ============================================================
alter publication supabase_realtime
  add table public.cash_sessions;

-- ============================================================
-- 7. Horarios por defecto para el restaurante demo
-- ============================================================
insert into public.restaurant_hours (restaurant_id, day_of_week, open_time, close_time, is_closed)
select r.id, d.day, '09:00'::time, '22:00'::time, false
from public.restaurants r
cross join generate_series(0, 6) as d(day)
where r.slug = 'demo'
on conflict (restaurant_id, day_of_week) do nothing;
