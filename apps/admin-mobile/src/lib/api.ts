// ============================================================
// Restaurante Pro Admin Mobile — API wrapper
// ============================================================
// Pre-binding del cliente Supabase para simplificar las pantallas.
import { supabase } from './supabase';
import { adminApi, staffApi } from '@restaurante-pro/shared';

export const fetchCategories = (restaurantId: string) =>
  adminApi.fetchCategories(supabase, restaurantId);
export const createCategory = (data: { restaurant_id: string; name: string; sort_order?: number }) =>
  adminApi.createCategory(supabase, data);
export const updateCategory = (id: string, updates: { name?: string; sort_order?: number; is_active?: boolean }) =>
  adminApi.updateCategory(supabase, id, updates);
export const deleteCategory = (id: string) =>
  adminApi.deleteCategory(supabase, id);

export const fetchIngredients = (restaurantId: string) =>
  adminApi.fetchIngredients(supabase, restaurantId);

export const fetchProducts = (restaurantId: string) =>
  adminApi.fetchProducts(supabase, restaurantId);
export const createProduct = (product: any) =>
  adminApi.createProduct(supabase, product);
export const updateProduct = (id: string, updates: any) =>
  adminApi.updateProduct(supabase, id, updates);
export const deleteProduct = (id: string) =>
  adminApi.deleteProduct(supabase, id);

export const fetchTables = (restaurantId: string) =>
  adminApi.fetchTables(supabase, restaurantId);
export const createTable = (table: any) =>
  adminApi.createTable(supabase, table);
export const updateTable = (id: string, updates: any) =>
  adminApi.updateTable(supabase, id, updates);
export const deleteTable = (id: string) =>
  adminApi.deleteTable(supabase, id);

export const fetchDashboardStats = (restaurantId: string) =>
  adminApi.fetchDashboardStats(supabase, restaurantId);

export const fetchUsers = (restaurantId: string) =>
  adminApi.fetchUsers(supabase, restaurantId);
export const fetchRoles = () =>
  adminApi.fetchRoles(supabase);
export const inviteStaffUser = (params: any) =>
  adminApi.inviteStaffUser(supabase, params);

export const fetchActiveOrders = (restaurantId: string) =>
  staffApi.fetchActiveOrders(supabase, restaurantId);
export const updateOrderStatus = (orderId: string, status: string) =>
  staffApi.updateOrderStatus(supabase, orderId, status);
export const fetchOrdersByTable = (restaurantId: string, tableId: string) =>
  staffApi.fetchOrdersByTable(supabase, restaurantId, tableId);
export const subscribeToOrders = (restaurantId: string, callback: () => void) =>
  staffApi.subscribeToOrders(supabase, restaurantId, callback);

export const fetchPendingPayments = (restaurantId: string) =>
  staffApi.fetchPendingPayments(supabase, restaurantId);
export const registerPayment = (payment: any) =>
  staffApi.registerPayment(supabase, payment);

export { supabase };
