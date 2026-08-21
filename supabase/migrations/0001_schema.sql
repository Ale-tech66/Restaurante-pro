-- ============================================================
-- Restaurante Pro — Esquema inicial (multi-restaurante)
-- ============================================================
-- Este script crea todas las tablas del sistema.
-- Las políticas de seguridad (RLS) van en 0002_rls.sql
-- ============================================================

-- Extensiones
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. Restaurantes
-- ============================================================
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  address text,
  phone text,
  email text,
  tax_rate numeric(5,2) not null default 0,
  currency text not null default 'MXN',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. Roles y permisos
-- ============================================================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,           -- admin, mesero, cocina, cajero, cliente
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,           -- ej: products.manage, orders.create
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ============================================================
-- 3. Usuarios (perfil de negocio, ligado a auth.users de Supabase)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  full_name text not null,
  email text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_restaurant_idx
  on public.users (email, restaurant_id);

-- ============================================================
-- 4. Categorías del menú
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_restaurant_idx on public.categories (restaurant_id);

-- ============================================================
-- 5. Productos
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_restaurant_idx on public.products (restaurant_id);
create index if not exists products_category_idx on public.products (category_id);

-- ============================================================
-- 6. Opciones de producto (extras, tamaños, variantes)
-- ============================================================
create table if not exists public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,                  -- ej: "Queso adicional", "Tamaño"
  type text not null default 'addon',  -- addon | size | variant
  price_adjustment numeric(10,2) not null default 0,
  is_required boolean not null default false,
  is_multi_select boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_options_product_idx on public.product_options (product_id);

-- Valores posibles para una opción (ej: Chico/Mediano/Grande)
create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  product_option_id uuid not null references public.product_options(id) on delete cascade,
  name text not null,
  price_adjustment numeric(10,2) not null default 0,
  sort_order int not null default 0
);

create index if not exists option_values_option_idx on public.product_option_values (product_option_id);

-- ============================================================
-- 7. Mesas
-- ============================================================
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  number text not null,               -- ej: "Mesa 1", "Terraza 3"
  capacity int not null default 4,
  status text not null default 'libre', -- libre | ocupada | esperando_pago | reservada | fuera_servicio
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tables_restaurant_idx on public.tables (restaurant_id);
create unique index if not exists tables_restaurant_number_idx on public.tables (restaurant_id, number);

-- ============================================================
-- 8. Códigos QR de mesas
-- ============================================================
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete cascade,
  token text not null unique,         -- token público, invalidable y renovable
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  invalidated_at timestamptz
);

create index if not exists qr_codes_token_idx on public.qr_codes (token);

-- ============================================================
-- 9. Ingredientes e inventario
-- ============================================================
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  unit text not null default 'unidad', -- gramo | ml | unidad | etc.
  stock numeric(12,3) not null default 0,
  min_stock numeric(12,3) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ingredients_restaurant_idx on public.ingredients (restaurant_id);

-- Recetas: relación producto → ingredientes con cantidades
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  quantity numeric(12,3) not null default 1,
  unique (product_id, ingredient_id)
);

create index if not exists recipes_product_idx on public.recipes (product_id);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  type text not null,                 -- entrada | salida | ajuste
  quantity numeric(12,3) not null,
  reason text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create index if not exists inv_movements_restaurant_idx on public.inventory_movements (restaurant_id);
create index if not exists inv_movements_ingredient_idx on public.inventory_movements (ingredient_id);

-- ============================================================
-- 10. Clientes
-- ============================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  loyalty_points int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_restaurant_idx on public.customers (restaurant_id);

-- ============================================================
-- 11. Pedidos
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_id uuid references public.tables(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  order_number int not null,
  status text not null default 'nuevo', -- nuevo | aceptado | preparando | listo | entregado | pagado | cancelado
  subtotal numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  tip_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_restaurant_idx on public.orders (restaurant_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_table_idx on public.orders (table_id);
create unique index if not exists orders_restaurant_number_idx on public.orders (restaurant_id, order_number);

-- Detalles del pedido
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- Opciones seleccionadas en cada item del pedido
create table if not exists public.order_item_options (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  product_option_id uuid references public.product_options(id) on delete set null,
  product_option_value_id uuid references public.product_option_values(id) on delete set null,
  option_name text not null,
  value_name text,
  price_adjustment numeric(10,2) not null default 0
);

create index if not exists order_item_options_item_idx on public.order_item_options (order_item_id);

-- ============================================================
-- 12. Pagos
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  method text not null,               -- efectivo | tarjeta | transferencia
  amount numeric(10,2) not null,
  processed_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create index if not exists payments_order_idx on public.payments (order_id);
create index if not exists payments_restaurant_idx on public.payments (restaurant_id);

-- ============================================================
-- 13. Descuentos / promociones
-- ============================================================
create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  type text not null,                 -- percentage | fixed
  value numeric(10,2) not null,
  code text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists discounts_restaurant_idx on public.discounts (restaurant_id);

-- ============================================================
-- 14. Notificaciones
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  message text,
  type text not null,                 -- order | inventory | system
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists notifications_restaurant_idx on public.notifications (restaurant_id);

-- ============================================================
-- 15. Auditoría
-- ============================================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  action text not null,               -- login | product.create | price.update | order.cancel | payment | inventory.adjust
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_restaurant_idx on public.audit_logs (restaurant_id);
create index if not exists audit_user_idx on public.audit_logs (user_id);
create index if not exists audit_created_idx on public.audit_logs (created_at);

-- ============================================================
-- Triggers: updated_at automático
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'restaurants', 'users', 'categories', 'products', 'tables',
    'ingredients', 'customers', 'orders', 'notifications'
  ])
  loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();', t);
  end loop;
end;
$$;

-- ============================================================
-- Número de pedido secuencial por restaurante
-- ============================================================
create or replace function public.next_order_number(rid uuid)
returns int
language sql
as $$
  select coalesce(max(order_number), 0) + 1 from public.orders where restaurant_id = rid;
$$;
