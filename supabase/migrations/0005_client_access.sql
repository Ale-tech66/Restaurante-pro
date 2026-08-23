-- ============================================================
-- Restaurante Pro — 0005: Acceso del cliente (QR anónimo)
-- ============================================================
-- Los clientes acceden al menú escaneando un QR de mesa.
-- No tienen cuenta de usuario. Estas RPCs permiten:
--   1. Validar el token QR y obtener restaurant_id + table_id
--   2. Leer el menú completo (productos, categorías, opciones)
--   3. Crear un pedido completo (order + items + opciones)
-- Todo validado por el token QR, sin necesidad de login.
-- ============================================================

-- ============================================================
-- 1. RPC: get_menu_by_qr_token
-- ============================================================
-- Valida el token QR de una mesa y devuelve:
--   - restaurant_id, restaurant_name, table_id, table_number
--   - categorías activas
--   - productos disponibles con sus opciones y valores
-- Un cliente anónimo (anon) puede llamarla.

create or replace function public.get_menu_by_qr_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qr record;
  v_restaurant record;
  v_table record;
  v_categories jsonb;
  v_products jsonb;
  v_options jsonb;
  v_option_values jsonb;
begin
  -- Validar el token QR
  select * into v_qr
    from public.qr_codes
    where token = p_token
      and is_active = true
      and invalidated_at is null;

  if not found then
    raise exception 'Token QR inválido o expirado';
  end if;

  -- Obtener la mesa y el restaurante
  select * into v_table from public.tables where id = v_qr.table_id;
  if not found then
    raise exception 'Mesa no encontrada para este QR';
  end if;

  select * into v_restaurant from public.restaurants where id = v_table.restaurant_id;
  if not found or not v_restaurant.is_active then
    raise exception 'Restaurante no disponible';
  end if;

  -- Categorías activas
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'name', c.name, 'sort_order', c.sort_order
  ) order by c.sort_order), '[]'::jsonb) into v_categories
  from public.categories c
  where c.restaurant_id = v_restaurant.id
    and c.is_active = true;

  -- Productos disponibles con categoría
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id, 'category_id', p.category_id, 'name', p.name,
    'description', p.description, 'price', p.price,
    'image_url', p.image_url, 'is_featured', p.is_featured,
    'sort_order', p.sort_order
  ) order by p.sort_order, p.name), '[]'::jsonb) into v_products
  from public.products p
  where p.restaurant_id = v_restaurant.id
    and p.is_available = true;

  -- Opciones de productos
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', po.id, 'product_id', po.product_id, 'name', po.name,
    'type', po.type, 'price_adjustment', po.price_adjustment,
    'is_required', po.is_required, 'is_multi_select', po.is_multi_select,
    'sort_order', po.sort_order
  ) order by po.sort_order), '[]'::jsonb) into v_options
  from public.product_options po
  join public.products p on p.id = po.product_id
  where p.restaurant_id = v_restaurant.id;

  -- Valores de opciones
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', pov.id, 'product_option_id', pov.product_option_id,
    'name', pov.name, 'price_adjustment', pov.price_adjustment,
    'sort_order', pov.sort_order
  ) order by pov.sort_order), '[]'::jsonb) into v_option_values
  from public.product_option_values pov
  join public.product_options po on po.id = pov.product_option_id
  join public.products p on p.id = po.product_id
  where p.restaurant_id = v_restaurant.id;

  return jsonb_build_object(
    'restaurant_id', v_restaurant.id,
    'restaurant_name', v_restaurant.name,
    'restaurant_logo', v_restaurant.logo_url,
    'currency', v_restaurant.currency,
    'tax_rate', v_restaurant.tax_rate,
    'table_id', v_table.id,
    'table_number', v_table.number,
    'categories', v_categories,
    'products', v_products,
    'product_options', v_options,
    'product_option_values', v_option_values
  );
end;
$$;

grant execute on function public.get_menu_by_qr_token(text) to anon, authenticated;

-- ============================================================
-- 2. RPC: create_client_order
-- ============================================================
-- Crea un pedido completo desde el cliente (anónimo):
--   - Valida el token QR
--   - Crea el order con table_id y restaurant_id correctos
--   - Inserta cada order_item con su unit_price (validado contra la BD)
--   - Inserta las opciones seleccionadas de cada item
--
-- Parámetros:
--   p_qr_token   — token del QR de la mesa
--   p_items      — array de items [{ product_id, quantity, notes, options: [{ option_id, value_id }] }]
--   p_notes      — notas generales del pedido (opcional)
--
-- Retorna el order_id y order_number.

create or replace function public.create_client_order(
  p_qr_token text,
  p_items jsonb,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qr record;
  v_table record;
  v_restaurant record;
  v_order_id uuid;
  v_order_number int;
  v_item jsonb;
  v_item_id uuid;
  v_product record;
  v_opt jsonb;
  v_opt_record record;
  v_val_record record;
  v_unit_price numeric;
  v_subtotal numeric := 0;
  v_tax_amount numeric := 0;
  v_total numeric := 0;
  v_item_total numeric;
begin
  -- Validar token QR
  select * into v_qr
    from public.qr_codes
    where token = p_qr_token
      and is_active = true
      and invalidated_at is null;

  if not found then
    raise exception 'Token QR inválido o expirado';
  end if;

  select * into v_table from public.tables where id = v_qr.table_id;
  if not found then
    raise exception 'Mesa no encontrada';
  end if;

  select * into v_restaurant from public.restaurants where id = v_table.restaurant_id;
  if not found or not v_restaurant.is_active then
    raise exception 'Restaurante no disponible';
  end if;

  -- Validar que haya items
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'No hay items en el pedido';
  end if;

  -- Crear el pedido (order_number se asigna por trigger)
  insert into public.orders (
    restaurant_id, table_id, status, subtotal, tax_amount,
    discount_amount, tip_amount, total, notes
  ) values (
    v_restaurant.id, v_table.id, 'nuevo',
    0, 0, 0, 0, 0, p_notes
  )
  returning id, order_number into v_order_id, v_order_number;

  -- Procesar cada item
  for v_item in select * from jsonb_array_elements(p_items) loop
    -- Obtener el producto y validar precio
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid
        and restaurant_id = v_restaurant.id
        and is_available = true;

    if not found then
      raise exception 'Producto no disponible: %', v_item->>'product_id';
    end if;

    v_unit_price := v_product.price;
    v_item_total := v_unit_price * (v_item->>'quantity')::int;

    -- Crear el order_item
    insert into public.order_items (order_id, product_id, quantity, unit_price, notes)
    values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      v_unit_price,
      nullif(v_item->>'notes', '')
    )
    returning id into v_item_id;

    -- Procesar opciones seleccionadas
    if v_item ? 'options' and jsonb_typeof(v_item->'options') = 'array' then
      for v_opt in select * from jsonb_array_elements(v_item->'options') loop
        -- Obtener la opción
        select * into v_opt_record from public.product_options
          where id = (v_opt->>'option_id')::uuid
            and product_id = v_product.id;

        if not found then
          raise exception 'Opción no válida para el producto %', v_product.name;
        end if;

        -- Obtener el valor seleccionado (si aplica)
        if v_opt ? 'value_id' and (v_opt->>'value_id') is not null then
          select * into v_val_record from public.product_option_values
            where id = (v_opt->>'value_id')::uuid
              and product_option_id = v_opt_record.id;

          if not found then
            raise exception 'Valor de opción no válido: %', v_opt->>'value_id';
          end if;

          insert into public.order_item_options (
            order_item_id, product_option_id, product_option_value_id,
            option_name, value_name, price_adjustment
          ) values (
            v_item_id, v_opt_record.id, v_val_record.id,
            v_opt_record.name, v_val_record.name, v_val_record.price_adjustment
          );

          v_item_total := v_item_total + (v_val_record.price_adjustment * (v_item->>'quantity')::int);
        else
          -- Opción sin valor (ej: "Sin cebolla") - usa el price_adjustment de la opción
          insert into public.order_item_options (
            order_item_id, product_option_id, product_option_value_id,
            option_name, value_name, price_adjustment
          ) values (
            v_item_id, v_opt_record.id, null,
            v_opt_record.name, null, v_opt_record.price_adjustment
          );

          v_item_total := v_item_total + (v_opt_record.price_adjustment * (v_item->>'quantity')::int);
        end if;
      end loop;
    end if;

    v_subtotal := v_subtotal + v_item_total;
  end loop;

  -- Calcular impuestos y total
  v_tax_amount := round((v_subtotal * v_restaurant.tax_rate / 100.0)::numeric, 2);
  v_total := v_subtotal + v_tax_amount;

  -- Actualizar el pedido con los totales
  update public.orders
    set subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total = v_total
    where id = v_order_id;

  -- Marcar la mesa como ocupada
  update public.tables set status = 'ocupada' where id = v_table.id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'tax_amount', v_tax_amount,
    'total', v_total
  );
end;
$$;

grant execute on function public.create_client_order(text, jsonb, text) to anon, authenticated;
