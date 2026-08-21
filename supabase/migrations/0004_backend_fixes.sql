-- ============================================================
-- Restaurante Pro — 0004: Fixes de backend
-- ============================================================
-- 1. Realtime publication (KDS + mesero en tiempo real)
-- 2. Número de pedido seguro (sin race condition)
-- 3. Trigger: order_number automático al insertar pedido
-- 4. RPC: invite_staff_user (admin invita personal)
-- 5. RPC: claim_restaurant_admin (bootstrap del primer admin)
-- ============================================================

-- ============================================================
-- 1. REALTIME — activar tablas en la publication de Supabase
-- ============================================================
-- Sin esto, supabase.channel('...') nunca emite eventos INSERT/UPDATE.
-- Solo se añaden las tablas que el frontend escucha en tiempo real.
alter publication supabase_realtime
  add table public.orders,
  add table public.order_items,
  add table public.order_item_options,
  add table public.tables,
  add table public.payments,
  add table public.notifications;

-- ============================================================
-- 2. NÚMERO DE PEDIDO SEGURO (advisory lock por restaurante)
-- ============================================================
-- Reemplaza la versión anterior (max+1 sin lock) que producía
-- race conditions bajo concurrencia. pg_advisory_xact_lock
-- bloquea hasta el final de la transacción y se libera solo.

drop function if exists public.next_order_number(uuid);

create or replace function public.next_order_number(rid uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  next_num int;
begin
  -- Lock por restaurante: hashtext produce un int32 estable por UUID.
  -- Dos pedidos del mismo restaurante se serializan; los de distintos
  -- restaurantes no se bloquean entre sí.
  perform pg_advisory_xact_lock(hashtext(rid::text));

  select coalesce(max(order_number), 0) + 1
    into next_num
  from public.orders
  where restaurant_id = rid;

  return next_num;
end;
$$;

-- ============================================================
-- 3. TRIGGER — order_number automático al insertar
-- ============================================================
-- Así la app no necesita calcular ni enviar order_number;
-- la BD lo asigna de forma segura dentro de la misma transacción.

create or replace function public.set_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_number is null or new.order_number = 0 then
    new.order_number := public.next_order_number(new.restaurant_id);
  end if;
  return new;
end;
$$;

drop trigger if exists set_order_number_trigger on public.orders;
create trigger set_order_number_trigger
  before insert on public.orders
  for each row execute function public.set_order_number();

-- ============================================================
-- 4. RPC: invite_staff_user
-- ============================================================
-- Permite a un admin invitar personal (mesero, cocina, cajero)
-- a su restaurante. Crea el usuario en auth.users y el perfil
-- en public.users con el rol correcto.
--
-- Parámetros:
--   p_email        — email del nuevo personal
--   p_full_name    — nombre completo
--   p_role_name    — 'mesero' | 'cocina' | 'cajero' | 'admin'
--   p_password     — contraseña inicial (el usuario puede cambiarla)
--
-- El caller debe ser admin de su restaurante.

create or replace function public.invite_staff_user(
  p_email text,
  p_full_name text,
  p_role_name text,
  p_password text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_restaurant_id uuid;
  v_role_id uuid;
  v_user_id uuid;
begin
  -- Verificar que el caller es admin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede invitar personal';
  end if;

  v_restaurant_id := public.current_user_restaurant_id();
  if v_restaurant_id is null then
    raise exception 'El administrador no tiene restaurante asignado';
  end if;

  -- Validar rol solicitado
  if p_role_name not in ('mesero', 'cocina', 'cajero', 'admin') then
    raise exception 'Rol no válido: %. Debe ser mesero, cocina, cajero o admin', p_role_name;
  end if;

  select id into v_role_id from public.roles where name = p_role_name;
  if v_role_id is null then
    raise exception 'Rol no encontrado en la BD: %', p_role_name;
  end if;

  -- Verificar que el email no exista ya en este restaurante
  if exists (
    select 1 from public.users
    where email = p_email and restaurant_id = v_restaurant_id
  ) then
    raise exception 'Ya existe un usuario con email % en este restaurante', p_email;
  end if;

  -- Crear usuario en auth.users (contraseña hasheada con pgcrypto)
  v_user_id := gen_random_uuid();
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    lower(p_email),
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', p_full_name)
  )
  on conflict (id) do nothing;

  -- Crear perfil en public.users
  insert into public.users (id, restaurant_id, role_id, full_name, email, is_active)
  values (v_user_id, v_restaurant_id, v_role_id, p_full_name, lower(p_email), true)
  on conflict (id) do update set
    restaurant_id = excluded.restaurant_id,
    role_id = excluded.role_id,
    full_name = excluded.full_name,
    is_active = true;

  return v_user_id;
end;
$$;

grant execute on function public.invite_staff_user(text, text, text, text) to authenticated;

-- ============================================================
-- 5. RPC: claim_restaurant_admin (bootstrap del primer admin)
-- ============================================================
-- Resuelve el problema de gallina-y-huevo: el trigger
-- handle_new_user asigna rol 'cliente' a todos los registros nuevos
-- y restaurant_id = null, por lo que nadie puede gestionar nada.
--
-- Este RPC permite a un usuario autenticado reclamar la
-- administración de un restaurante SOLO si ese restaurante
-- aún no tiene un admin asignado.
--
-- Parámetros:
--   p_restaurant_slug — slug del restaurante a reclamar

create or replace function public.claim_restaurant_admin(p_restaurant_slug text)
returns public.restaurants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant public.restaurants%rowtype;
  v_admin_role_id uuid;
  v_caller_id uuid;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Debe estar autenticado para reclamar un restaurante';
  end if;

  -- Buscar el restaurante por slug
  select * into v_restaurant from public.restaurants where slug = p_restaurant_slug;
  if not found then
    raise exception 'Restaurante no encontrado con slug: %', p_restaurant_slug;
  end if;

  -- Verificar que el restaurante no tenga ya un admin
  if exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.restaurant_id = v_restaurant.id
      and r.name = 'admin'
      and u.is_active = true
  ) then
    raise exception 'El restaurante % ya tiene un administrador asignado', v_restaurant.name;
  end if;

  -- Asignar rol admin al caller y vincularlo al restaurante
  select id into v_admin_role_id from public.roles where name = 'admin';

  update public.users
    set role_id = v_admin_role_id,
        restaurant_id = v_restaurant.id,
        is_active = true
  where id = v_caller_id;

  return v_restaurant;
end;
$$;

grant execute on function public.claim_restaurant_admin(text) to authenticated;
