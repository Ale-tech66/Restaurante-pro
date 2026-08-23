import { supabase } from '@/lib/supabase';

// ============================================================
// API del Staff (cocina, mesero, caja)
// ============================================================

export interface OrderWithItems {
  id: string;
  order_number: number;
  status: string;
  table_id: string | null;
  table_number: string | null;
  customer_name: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
  items: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  options: { option_name: string; value_name: string | null }[];
}

// Obtener pedidos activos (no entregados ni cancelados) para la cocina
export async function fetchActiveOrders(restaurantId: string): Promise<OrderWithItems[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      table_id,
      notes,
      subtotal,
      tax_amount,
      total,
      created_at,
      table:tables(number),
      customer:customers(full_name)
    `)
    .eq('restaurant_id', restaurantId)
    .in('status', ['nuevo', 'aceptado', 'preparando', 'listo'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);

  // Obtener items de todos los pedidos de una sola vez
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      product_id,
      quantity,
      unit_price,
      notes,
      product:products(name)
    `)
    .in('order_id', orderIds)
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  // Obtener opciones de los items
  const itemIds = items?.map((i) => i.id) ?? [];
  let optionsMap: Record<string, { option_name: string; value_name: string | null }[]> = {};

  if (itemIds.length > 0) {
    const { data: options, error: optError } = await supabase
      .from('order_item_options')
      .select('order_item_id, option_name, value_name')
      .in('order_item_id', itemIds);

    if (optError) throw optError;

    options?.forEach((opt) => {
      const key = opt.order_item_id;
      if (!optionsMap[key]) optionsMap[key] = [];
      optionsMap[key].push({
        option_name: opt.option_name,
        value_name: opt.value_name,
      });
    });
  }

  // Mapear todo
  return orders.map((order) => {
    const orderItems = (items ?? [])
      .filter((i) => i.order_id === order.id)
      .map((i) => ({
        id: i.id,
        product_id: i.product_id,
        product_name: (i.product as any)?.name ?? 'Producto',
        quantity: i.quantity,
        unit_price: i.unit_price,
        notes: i.notes,
        options: optionsMap[i.id] ?? [],
      }));

    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      table_id: order.table_id,
      table_number: (order.table as any)?.number ?? null,
      customer_name: (order.customer as any)?.full_name ?? null,
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      total: order.total,
      notes: order.notes,
      created_at: order.created_at,
      items: orderItems,
    };
  });
}

// Actualizar el estado de un pedido
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

// Suscripción realtime a cambios en pedidos
export function subscribeToOrders(
  restaurantId: string,
  callback: () => void
): () => void {
  const channel = supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      () => callback()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'order_items',
      },
      () => callback()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Obtener pedidos por mesa (para el mesero)
export async function fetchOrdersByTable(
  restaurantId: string,
  tableId: string
): Promise<OrderWithItems[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      table_id,
      notes,
      subtotal,
      tax_amount,
      total,
      created_at,
      table:tables(number),
      customer:customers(full_name)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('table_id', tableId)
    .in('status', ['nuevo', 'aceptado', 'preparando', 'listo', 'entregado', 'pagado'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      product_id,
      quantity,
      unit_price,
      notes,
      product:products(name)
    `)
    .in('order_id', orderIds)
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  return orders.map((order) => {
    const orderItems = (items ?? [])
      .filter((i) => i.order_id === order.id)
      .map((i) => ({
        id: i.id,
        product_id: i.product_id,
        product_name: (i.product as any)?.name ?? 'Producto',
        quantity: i.quantity,
        unit_price: i.unit_price,
        notes: i.notes,
        options: [],
      }));

    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      table_id: order.table_id,
      table_number: (order.table as any)?.number ?? null,
      customer_name: (order.customer as any)?.full_name ?? null,
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      total: order.total,
      notes: order.notes,
      created_at: order.created_at,
      items: orderItems,
    };
  });
}
