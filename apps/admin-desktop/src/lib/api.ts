// ============================================================
// Restaurante Pro Desktop — API (usa el cliente Supabase local)
// ============================================================
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

export async function createCategory(category: { restaurant_id: string; name: string }) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: { name?: string; is_active?: boolean }) {
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
  is_available?: boolean;
  is_featured?: boolean;
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
    category_id: string | null;
    is_available: boolean;
    is_featured: boolean;
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

export async function createTable(table: { restaurant_id: string; number: string; capacity?: number }) {
  const { data, error } = await supabase
    .from('tables')
    .insert(table)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTable(id: string, updates: Partial<{ number: string; capacity: number; status: string }>) {
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
// Dashboard
// ============================================================
export async function fetchDashboardStats(restaurantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [ordersToday, productsCount, tablesCount, pendingOrders] = await Promise.all([
    supabase.from('orders').select('id, total').eq('restaurant_id', restaurantId).gte('created_at', todayISO),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurantId),
    supabase.from('tables').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurantId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).in('status', ['nuevo', 'aceptado', 'preparando']),
  ]);

  if (ordersToday.error) throw ordersToday.error;
  if (productsCount.error) throw productsCount.error;
  if (tablesCount.error) throw tablesCount.error;
  if (pendingOrders.error) throw pendingOrders.error;

  const salesToday = (ordersToday.data ?? []).reduce((sum, o: any) => sum + Number(o.total), 0);

  return {
    ordersTodayCount: ordersToday.data?.length ?? 0,
    salesToday,
    productsCount: productsCount.count ?? 0,
    tablesCount: tablesCount.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
  };
}

// ============================================================
// Pedidos
// ============================================================
export async function fetchActiveOrders(restaurantId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, table:tables(number), customer:customers(full_name)')
    .eq('restaurant_id', restaurantId)
    .in('status', ['nuevo', 'aceptado', 'preparando', 'listo'])
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

// ============================================================
// Usuarios
// ============================================================
export async function fetchUsers(restaurantId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchRoles() {
  const { data, error } = await supabase.from('roles').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function inviteStaffUser(params: {
  email: string;
  fullName: string;
  roleName: string;
  restaurantId: string;
}) {
  const { data, error } = await supabase.rpc('invite_staff_user', {
    p_email: params.email,
    p_full_name: params.fullName,
    p_role: params.roleName,
    p_restaurant_id: params.restaurantId,
  });
  if (error) throw error;
  return data;
}

// Bootstrap: reclamar la administración de un restaurante que aún no tiene admin
export async function claimRestaurantAdmin(slug: string) {
  const { data, error } = await supabase.rpc('claim_restaurant_admin', {
    p_restaurant_slug: slug,
  });
  if (error) throw error;
  return data;
}

// Crear un restaurante nuevo desde cero (RLS: cualquier autenticado puede insertar)
export async function createRestaurant(params: { name: string; slug: string }) {
  const { data, error } = await supabase
    .from('restaurants')
    .insert({ name: params.name, slug: params.slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// Inventario
// ============================================================
export async function fetchIngredients(restaurantId: string) {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

// ============================================================
// Pagos
// ============================================================
export async function fetchPendingPayments(restaurantId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, total, status, table:tables(number), created_at')
    .eq('restaurant_id', restaurantId)
    .in('status', ['entregado'])
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function registerPayment(payment: {
  order_id: string;
  restaurant_id: string;
  method: string;
  amount: number;
}) {
  const { data, error } = await supabase.from('payments').insert(payment).select().single();
  if (error) throw error;
  await supabase.from('orders').update({ status: 'pagado', updated_at: new Date().toISOString() }).eq('id', payment.order_id);
  return data;
}
