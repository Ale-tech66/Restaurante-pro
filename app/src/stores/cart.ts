import { create } from 'zustand';

// ============================================================
// Tipos del carrito del cliente
// ============================================================
export interface CartOption {
  option_id: string;
  value_id: string | null;
  option_name: string;
  value_name: string | null;
  price_adjustment: number;
}

export interface CartItem {
  id: string; // product_id + timestamp para diferenciar
  product_id: string;
  name: string;
  base_price: number;
  quantity: number;
  notes: string;
  options: CartOption[];
}

export interface TableInfo {
  qr_token: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_logo: string | null;
  currency: string;
  tax_rate: number;
  table_id: string;
  table_number: string;
}

interface MenuProductOption {
  id: string;
  product_id: string;
  name: string;
  type: string;
  price_adjustment: number;
  is_required: boolean;
  is_multi_select: boolean;
  sort_order: number;
}

interface MenuProductOptionValue {
  id: string;
  product_option_id: string;
  name: string;
  price_adjustment: number;
  sort_order: number;
}

export interface MenuProduct {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
}

interface MenuData {
  products: MenuProduct[];
  product_options: MenuProductOption[];
  product_option_values: MenuProductOptionValue[];
}

interface CartState {
  tableInfo: TableInfo | null;
  items: CartItem[];
  menuData: MenuData | null;
  setMenuData: (data: MenuData) => void;
  setTableInfo: (info: TableInfo) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  // Selectores derivados
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

function itemTotal(item: CartItem): number {
  const optionsAdjustment = item.options.reduce(
    (sum, o) => sum + o.price_adjustment,
    0
  );
  return (item.base_price + optionsAdjustment) * item.quantity;
}

export const useCartStore = create<CartState>((set, get) => ({
  tableInfo: null,
  items: [],
  menuData: null,

  setTableInfo: (info) => set({ tableInfo: info }),

  setMenuData: (data) => set({ menuData: data }),

  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { ...item, id: `${item.product_id}-${Date.now()}` },
      ],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),

  updateNotes: (id, notes) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, notes } : i)),
    })),

  clearCart: () => set({ items: [] }),

  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getSubtotal: () => get().items.reduce((sum, i) => sum + itemTotal(i), 0),

  getTax: () => {
    const { items, tableInfo } = get();
    const subtotal = items.reduce((sum, i) => sum + itemTotal(i), 0);
    const rate = tableInfo?.tax_rate ?? 0;
    return Math.round(subtotal * rate) / 100;
  },

  getTotal: () => get().getSubtotal() + get().getTax(),
}));
