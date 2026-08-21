-- ============================================================
-- Restaurante Pro — Datos iniciales (seed)
-- ============================================================

-- Roles
insert into public.roles (name, description) values
  ('admin', 'Administrador con control total del restaurante'),
  ('mesero', 'Mesero: gestiona mesas y pedidos'),
  ('cocina', 'Cocina: recibe y prepara pedidos'),
  ('cajero', 'Cajero: procesa cobros y pagos'),
  ('cliente', 'Cliente: hace pedidos vía QR')
on conflict (name) do nothing;

-- Permisos
insert into public.permissions (name, description) values
  ('products.manage', 'Crear, editar y eliminar productos'),
  ('categories.manage', 'Gestionar categorías'),
  ('tables.manage', 'Gestionar mesas y códigos QR'),
  ('orders.create', 'Crear pedidos'),
  ('orders.update', 'Actualizar estado de pedidos'),
  ('orders.cancel', 'Cancelar pedidos'),
  ('payments.process', 'Procesar cobros y pagos'),
  ('inventory.manage', 'Gestionar inventario y recetas'),
  ('users.manage', 'Gestionar usuarios del restaurante'),
  ('reports.view', 'Ver reportes y estadísticas'),
  ('discounts.manage', 'Gestionar promociones y descuentos'),
  ('settings.manage', 'Configurar el restaurante')
on conflict (name) do nothing;

-- Asignar TODOS los permisos al rol admin
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'admin'
on conflict do nothing;

-- Permisos del mesero
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'mesero'
  and p.name in ('orders.create', 'orders.update')
on conflict do nothing;

-- Permisos de cocina
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'cocina'
  and p.name in ('orders.update')
on conflict do nothing;

-- Permisos del cajero
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'cajero'
  and p.name in ('payments.process', 'orders.update')
on conflict do nothing;

-- ============================================================
-- Restaurante demo
-- ============================================================
insert into public.restaurants (name, slug, address, phone, email, tax_rate, currency)
values (
  'Restaurante Demo',
  'demo',
  'Calle Principal 123',
  '+52 555 123 4567',
  'demo@restaurante.pro',
  16.00,
  'MXN'
)
on conflict (slug) do nothing;

-- ============================================================
-- Trigger: crear perfil de usuario automáticamente
-- cuando un nuevo usuario se registra en Supabase Auth
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, restaurant_id, role_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    null, -- restaurant_id se asigna después (el admin lo invita o lo vincula)
    (select id from public.roles where name = 'cliente' limit 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
