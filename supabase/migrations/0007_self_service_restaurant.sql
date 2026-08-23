-- ============================================================
-- Restaurante Pro — Migración 0007
-- Bootstrap self-service de restaurantes
-- ============================================================
-- Problema: los usuarios autenticados recibían "new row violates
-- row-level security policy" al intentar crear su primer restaurante
-- desde la app, aunque existía una policy restaurants_insert con
-- with check (true).
--
-- Solución: RPC SECURITY DEFINER atómica que:
--   1. Valida que el caller esté autenticado y sin restaurante
--   2. Inserta el restaurante (slug único garantizado)
--   3. Vincula al caller como ADMIN de ese restaurante
--
-- Todo corre con privilegios del dueño de la función, sin pelear
-- contra las políticas RLS. Solo accesible para 'authenticated'.
-- ============================================================

create or replace function public.create_my_restaurant(p_name text, p_slug text default null)
returns public.restaurants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_restaurant public.restaurants%rowtype;
  v_admin_role_id uuid;
  v_final_slug text;
begin
  if v_caller_id is null then
    raise exception 'Debe estar autenticado para crear un restaurante';
  end if;

  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'El nombre del restaurante es obligatorio (mínimo 2 caracteres)';
  end if;

  -- No duplicar vínculos: si ya tiene restaurante, fuera
  if exists (
    select 1 from public.users where id = v_caller_id and restaurant_id is not null
  ) then
    raise exception 'Tu cuenta ya está vinculada a un restaurante';
  end if;

  -- Normalizar slug del nombre (o del parámetro si viene)
  v_final_slug := lower(regexp_replace(trim(coalesce(nullif(trim(p_slug), ''), p_name)), '[^a-z0-9]+', '-', 'g'));
  v_final_slug := trim(both '-' from v_final_slug);
  if v_final_slug = '' or v_final_slug is null then
    v_final_slug := 'restaurante';
  end if;

  -- Garantizar unicidad de slug
  if exists (select 1 from public.restaurants where slug = v_final_slug) then
    v_final_slug := v_final_slug || '-' || substr(md5(random()::text), 1, 4);
  end if;

  insert into public.restaurants (name, slug)
  values (trim(p_name), v_final_slug)
  returning * into v_restaurant;

  -- Vincular al caller como administrador del nuevo restaurante
  select id into v_admin_role_id from public.roles where name = 'admin';

  update public.users
    set role_id = coalesce(v_admin_role_id, role_id),
        restaurant_id = v_restaurant.id,
        is_active = true
  where id = v_caller_id;

  return v_restaurant;
end;
$$;

revoke execute on function public.create_my_restaurant(text, text) from anon, public;
grant execute on function public.create_my_restaurant(text, text) to authenticated;
