import { create } from 'zustand';

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  notes: string;
  options: { option_id: string; value_id: string | null; option_name: string; value_name: string | null; price_adjustment: number }[];
}

interface CartState {
  items: CartItem[];
  qrToken: string | null;
  restaurantName: string | null;
  tableNumber: string | null;
  setQrContext: (token: string, restaurantName: string, tableNumber: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  qrToken: null,
  restaurantName: null,
  tableNumber: null,

  setQrContext: (token, restaurantName, tableNumber) =>
    set({ qrToken: token, restaurantName, tableNumber }),

  addItem: (item) => {
    const items = get().items;
    const existing = items.findIndex(
      (i) => i.product_id === item.product_id && i.notes === item.notes &&
        JSON.stringify(i.options) === JSON.stringify(item.options)
    );
    if (existing >= 0) {
      const updated = [...items];
      updated[existing].quantity += item.quantity;
      set({ items: updated });
    } else {
      set({ items: [...items, item] });
    }
  },

  removeItem: (index) => set({ items: get().items.filter((_, i) => i !== index) }),

  updateQuantity: (index, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter((_, i) => i !== index) });
    } else {
      const updated = [...get().items];
      updated[index].quantity = quantity;
      set({ items: updated });
    }
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const optionsTotal = item.options.reduce((s, o) => s + (o.price_adjustment ?? 0), 0);
      return sum + (item.price + optionsTotal) * item.quantity;
    }, 0);
  },
}));
