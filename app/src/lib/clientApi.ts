import { supabase } from '@/lib/supabase';
import type { CartItem } from '@/stores/cart';

// ============================================================
// API del cliente (acceso anónimo vía QR)
// ============================================================

export interface MenuData {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_logo: string | null;
  currency: string;
  tax_rate: number;
  table_id: string;
  table_number: string;
  categories: {
    id: string;
    name: string;
    sort_order: number;
  }[];
  products: {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_featured: boolean;
    sort_order: number;
  }[];
  product_options: {
    id: string;
    product_id: string;
    name: string;
    type: string;
    price_adjustment: number;
    is_required: boolean;
    is_multi_select: boolean;
    sort_order: number;
  }[];
  product_option_values: {
    id: string;
    product_option_id: string;
    name: string;
    price_adjustment: number;
    sort_order: number;
  }[];
}

export interface CreateOrderResult {
  order_id: string;
  order_number: number;
  subtotal: number;
  tax_amount: number;
  total: number;
}

// Obtener el menú completo validando el token QR
export async function fetchMenuByQrToken(token: string): Promise<MenuData> {
  const { data, error } = await supabase.rpc('get_menu_by_qr_token', {
    p_token: token,
  });
  if (error) throw error;
  return data as MenuData;
}

// Crear un pedido completo desde el cliente
export async function createClientOrder(
  qrToken: string,
  items: CartItem[],
  notes?: string
): Promise<CreateOrderResult> {
  const payload = items.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    notes: item.notes || null,
    options: item.options.map((o) => ({
      option_id: o.option_id,
      value_id: o.value_id,
    })),
  }));

  const { data, error } = await supabase.rpc('create_client_order', {
    p_qr_token: qrToken,
    p_items: payload,
    p_notes: notes ?? null,
  });
  if (error) throw error;
  return data as CreateOrderResult;
}

// Suscribirse al estado de un pedido en tiempo real
export function subscribeToOrderStatus(
  orderId: string,
  callback: (status: string) => void
) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new.status);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
