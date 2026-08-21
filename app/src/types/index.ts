// ============================================================
// Tipos del dominio — alineados con las migraciones de Supabase
// ============================================================

export type RoleName = 'admin' | 'mesero' | 'cocina' | 'cajero' | 'cliente';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_rate: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: RoleName;
  description: string | null;
}

export interface User {
  id: string;
  restaurant_id: string | null;
  role_id: string;
  role?: Role;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  category?: Category;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  type: 'addon' | 'size' | 'variant';
  price_adjustment: number;
  is_required: boolean;
  is_multi_select: boolean;
  sort_order: number;
}

export interface ProductOptionValue {
  id: string;
  product_option_id: string;
  name: string;
  price_adjustment: number;
  sort_order: number;
}

export interface Table {
  id: string;
  restaurant_id: string;
  number: string;
  capacity: number;
  status: 'libre' | 'ocupada' | 'esperando_pago' | 'reservada' | 'fuera_servicio';
  created_at: string;
  updated_at: string;
}

export interface QrCode {
  id: string;
  table_id: string;
  token: string;
  is_active: boolean;
  created_at: string;
  invalidated_at: string | null;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  customer_id: string | null;
  order_number: number;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'nuevo'
  | 'aceptado'
  | 'preparando'
  | 'listo'
  | 'entregado'
  | 'pagado'
  | 'cancelado';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  restaurant_id: string;
  method: 'efectivo' | 'tarjeta' | 'transferencia';
  amount: number;
  processed_by: string | null;
  created_at: string;
}

export interface Ingredient {
  id: string;
  restaurant_id: string;
  name: string;
  unit: string;
  stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  restaurant_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  restaurant_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  title: string;
  message: string | null;
  type: 'order' | 'inventory' | 'system';
  is_read: boolean;
  created_at: string;
}
