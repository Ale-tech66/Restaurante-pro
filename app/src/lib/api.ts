import { supabase } from '@/lib/supabase';

// ============================================================
// Categorías
// ============================================================
export async function fetchCategories(restaurantId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createCategory(category: {
  restaurant_id: string;
  name: string;
  sort_order?: number;
}) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  updates: { name?: string; sort_order?: number; is_active?: boolean }
) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Productos
// ============================================================
export async function fetchProducts(restaurantId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProduct(product: {
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  is_available?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    is_available: boolean;
    is_featured: boolean;
    category_id: string | null;
    sort_order: number;
  }>
) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Mesas
// ============================================================
export async function fetchTables(restaurantId: string) {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('number', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createTable(table: {
  restaurant_id: string;
  number: string;
  capacity?: number;
}) {
  const { data, error } = await supabase
    .from('tables')
    .insert(table)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTable(
  id: string,
  updates: Partial<{ number: string; capacity: number; status: string }>
) {
  const { data, error } = await supabase
    .from('tables')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTable(id: string) {
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Dashboard (estadísticas rápidas)
// ============================================================
export async function fetchDashboardStats(restaurantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [ordersToday, productsCount, tablesCount, pendingOrders] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', todayISO),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId),
    supabase
      .from('tables')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .in('status', ['nuevo', 'aceptado', 'preparando']),
  ]);

  if (ordersToday.error) throw ordersToday.error;
  if (productsCount.error) throw productsCount.error;
  if (tablesCount.error) throw tablesCount.error;
  if (pendingOrders.error) throw pendingOrders.error;

  const salesToday = (ordersToday.data ?? []).reduce(
    (sum, o) => sum + Number(o.total),
    0
  );

  return {
    ordersTodayCount: ordersToday.data?.length ?? 0,
    salesToday,
    productsCount: productsCount.count ?? 0,
    tablesCount: tablesCount.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
  };
}
