-- ============================================================
-- Restaurante Pro — Row Level Security (multi-restaurante)
-- ============================================================
-- Todas las políticas garantizan que un restaurante no puede
-- acceder a los datos de otro restaurante.
-- ============================================================

-- ============================================================
-- Funciones helper
-- ============================================================

-- Devuelve el restaurant_id del usuario autenticado actual
create or replace function public.current_user_restaurant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select restaurant_id from public.users where id = auth.uid();
$$;

-- Devuelve el nombre del rol del usuario autenticado actual
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.users u
  join public.roles r on r.id = u.role_id
  where u.id = auth.uid();
$$;

-- Devuelve true si el usuario actual es admin de su restaurante
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

-- ============================================================
-- 1. restaurants
-- ============================================================
alter table public.restaurants enable row level security;

create policy "restaurants_select" on public.restaurants
  for select to authenticated
  using (id = public.current_user_restaurant_id());

create policy "restaurants_insert" on public.restaurants
  for insert to authenticated
  with check (true);

create policy "restaurants_update" on public.restaurants
  for update to authenticated
  using (id = public.current_user_restaurant_id() and public.is_admin());

-- ============================================================
-- 2. roles / permissions / role_permissions (datos globales)
-- ============================================================
alter table public.roles enable row level security;
create policy "roles_select" on public.roles
  for select to authenticated using (true);

alter table public.permissions enable row level security;
create policy "permissions_select" on public.permissions
  for select to authenticated using (true);

alter table public.role_permissions enable row level security;
create policy "role_permissions_select" on public.role_permissions
  for select to authenticated using (true);

-- ============================================================
-- 3. users (perfiles de negocio)
-- ============================================================
alter table public.users enable row level security;

create policy "users_select" on public.users
  for select to authenticated
  using (
    id = auth.uid()
    or restaurant_id = public.current_user_restaurant_id()
  );

create policy "users_insert_own" on public.users
  for insert to authenticated
  with check (id = auth.uid());

create policy "users_insert_admin" on public.users
  for insert to authenticated
  with check (
    restaurant_id = public.current_user_restaurant_id()
    and public.is_admin()
  );

create policy "users_update_own" on public.users
  for update to authenticated
  using (id = auth.uid());

create policy "users_update_admin" on public.users
  for update to authenticated
  using (
    restaurant_id = public.current_user_restaurant_id()
    and public.is_admin()
  );

create policy "users_delete_admin" on public.users
  for delete to authenticated
  using (
    restaurant_id = public.current_user_restaurant_id()
    and public.is_admin()
  );

-- ============================================================
-- 4. categories
-- ============================================================
alter table public.categories enable row level security;

create policy "categories_select" on public.categories
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "categories_insert" on public.categories
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "categories_update" on public.categories
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "categories_delete" on public.categories
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

-- ============================================================
-- 5. products
-- ============================================================
alter table public.products enable row level security;

create policy "products_select" on public.products
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "products_insert" on public.products
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "products_update" on public.products
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "products_delete" on public.products
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

-- ============================================================
-- 6. product_options (vía product → restaurant)
-- ============================================================
alter table public.product_options enable row level security;

create policy "product_options_select" on public.product_options
  for select to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_options.product_id
        and p.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "product_options_insert" on public.product_options
  for insert to authenticated
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_options.product_id
        and p.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

create policy "product_options_update" on public.product_options
  for update to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_options.product_id
        and p.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

create policy "product_options_delete" on public.product_options
  for delete to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_options.product_id
        and p.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

-- ============================================================
-- 7. product_option_values (vía option → product → restaurant)
-- ============================================================
alter table public.product_option_values enable row level security;

create policy "option_values_select" on public.product_option_values
  for select to authenticated
  using (
    exists (
      select 1 from public.product_options po
      join public.products p on p.id = po.product_id
      where po.id = product_option_values.product_option_id
        and p.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "option_values_insert" on public.product_option_values
  for insert to authenticated
  with check (
    exists (
      select 1 from public.product_options po
      join public.products p on p.id = po.product_id
      where po.id = product_option_values.product_option_id
        and p.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

create policy "option_values_update" on public.product_option_values
  for update to authenticated
  using (
    exists (
      select 1 from public.product_options po
      join public.products p on p.id = po.product_id
      where po.id = product_option_values.product_option_id
        and p.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

create policy "option_values_delete" on public.product_option_values
  for delete to authenticated
  using (
    exists (
      select 1 from public.product_options po
      join public.products p on p.id = po.product_id
      where po.id = product_option_values.product_option_id
        and p.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

-- ============================================================
-- 8. tables (mesas)
-- ============================================================
alter table public.tables enable row level security;

create policy "tables_select" on public.tables
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "tables_insert" on public.tables
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "tables_update" on public.tables
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "tables_delete" on public.tables
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

-- ============================================================
-- 9. qr_codes (vía table → restaurant)
-- ============================================================
alter table public.qr_codes enable row level security;

create policy "qr_codes_select" on public.qr_codes
  for select to authenticated
  using (
    exists (
      select 1 from public.tables t
      where t.id = qr_codes.table_id
        and t.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "qr_codes_insert" on public.qr_codes
  for insert to authenticated
  with check (
    exists (
      select 1 from public.tables t
      where t.id = qr_codes.table_id
        and t.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

create policy "qr_codes_update" on public.qr_codes
  for update to authenticated
  using (
    exists (
      select 1 from public.tables t
      where t.id = qr_codes.table_id
        and t.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

create policy "qr_codes_delete" on public.qr_codes
  for delete to authenticated
  using (
    exists (
      select 1 from public.tables t
      where t.id = qr_codes.table_id
        and t.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

-- ============================================================
-- 10. ingredients
-- ============================================================
alter table public.ingredients enable row level security;

create policy "ingredients_select" on public.ingredients
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "ingredients_insert" on public.ingredients
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "ingredients_update" on public.ingredients
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "ingredients_delete" on public.ingredients
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

-- ============================================================
-- 11. recipes (vía product → restaurant)
-- ============================================================
alter table public.recipes enable row level security;

create policy "recipes_select" on public.recipes
  for select to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = recipes.product_id
        and p.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "recipes_insert" on public.recipes
  for insert to authenticated
  with check (
    exists (
      select 1 from public.products p
      where p.id = recipes.product_id
        and p.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

create policy "recipes_delete" on public.recipes
  for delete to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = recipes.product_id
        and p.restaurant_id = public.current_user_restaurant_id()
    ) and public.is_admin()
  );

-- ============================================================
-- 12. inventory_movements
-- ============================================================
alter table public.inventory_movements enable row level security;

create policy "inv_movements_select" on public.inventory_movements
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "inv_movements_insert" on public.inventory_movements
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id());

-- ============================================================
-- 13. customers
-- ============================================================
alter table public.customers enable row level security;

create policy "customers_select" on public.customers
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "customers_insert" on public.customers
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id());

create policy "customers_update" on public.customers
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "customers_delete" on public.customers
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

-- ============================================================
-- 14. orders
-- ============================================================
alter table public.orders enable row level security;

create policy "orders_select" on public.orders
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "orders_insert" on public.orders
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id());

create policy "orders_update" on public.orders
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "orders_delete" on public.orders
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

-- ============================================================
-- 15. order_items (vía order → restaurant)
-- ============================================================
alter table public.order_items enable row level security;

create policy "order_items_select" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "order_items_insert" on public.order_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "order_items_update" on public.order_items
  for update to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "order_items_delete" on public.order_items
  for delete to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.restaurant_id = public.current_user_restaurant_id()
    )
  );

-- ============================================================
-- 16. order_item_options (vía order_item → order → restaurant)
-- ============================================================
alter table public.order_item_options enable row level security;

create policy "order_item_options_select" on public.order_item_options
  for select to authenticated
  using (
    exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = order_item_options.order_item_id
        and o.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "order_item_options_insert" on public.order_item_options
  for insert to authenticated
  with check (
    exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = order_item_options.order_item_id
        and o.restaurant_id = public.current_user_restaurant_id()
    )
  );

create policy "order_item_options_delete" on public.order_item_options
  for delete to authenticated
  using (
    exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = order_item_options.order_item_id
        and o.restaurant_id = public.current_user_restaurant_id()
    )
  );

-- ============================================================
-- 17. payments
-- ============================================================
alter table public.payments enable row level security;

create policy "payments_select" on public.payments
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "payments_insert" on public.payments
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id());

-- ============================================================
-- 18. discounts
-- ============================================================
alter table public.discounts enable row level security;

create policy "discounts_select" on public.discounts
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "discounts_insert" on public.discounts
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "discounts_update" on public.discounts
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

create policy "discounts_delete" on public.discounts
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id() and public.is_admin());

-- ============================================================
-- 19. notifications
-- ============================================================
alter table public.notifications enable row level security;

create policy "notifications_select" on public.notifications
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "notifications_insert" on public.notifications
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id());

create policy "notifications_update" on public.notifications
  for update to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "notifications_delete" on public.notifications
  for delete to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

-- ============================================================
-- 20. audit_logs (solo insert y select, nunca update/delete)
-- ============================================================
alter table public.audit_logs enable row level security;

create policy "audit_logs_select" on public.audit_logs
  for select to authenticated
  using (restaurant_id = public.current_user_restaurant_id());

create policy "audit_logs_insert" on public.audit_logs
  for insert to authenticated
  with check (restaurant_id = public.current_user_restaurant_id());
