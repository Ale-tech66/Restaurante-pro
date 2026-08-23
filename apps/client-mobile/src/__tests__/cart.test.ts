// ============================================================
// client-mobile — Test del Cart store (Zustand)
// ============================================================
import { useCartStore, CartItem } from '@/stores/cart';

function createItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'p1',
    name: 'Pizza',
    price: 100,
    quantity: 1,
    image_url: null,
    notes: '',
    options: [],
    ...overrides,
  };
}

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.setState({ qrToken: null, restaurantName: null, tableNumber: null });
  });

  describe('estado inicial', () => {
    it('empieza vacío', () => {
      const state = useCartStore.getState();
      expect(state.items).toEqual([]);
      expect(state.qrToken).toBeNull();
      expect(state.restaurantName).toBeNull();
      expect(state.tableNumber).toBeNull();
    });
  });

  describe('setQrContext', () => {
    it('guarda el contexto del QR', () => {
      useCartStore.getState().setQrContext('tok-1', 'Restaurante XYZ', 'Mesa 5');
      const state = useCartStore.getState();
      expect(state.qrToken).toBe('tok-1');
      expect(state.restaurantName).toBe('Restaurante XYZ');
      expect(state.tableNumber).toBe('Mesa 5');
    });
  });

  describe('addItem', () => {
    it('añade un item nuevo', () => {
      useCartStore.getState().addItem(createItem());
      expect(useCartStore.getState().items).toHaveLength(1);
    });

    it('incrementa cantidad si el item ya existe (mismo producto, notas y opciones)', () => {
      useCartStore.getState().addItem(createItem({ quantity: 2 }));
      useCartStore.getState().addItem(createItem({ quantity: 3 }));
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5);
    });

    it('añade item separado si las notas son diferentes', () => {
      useCartStore.getState().addItem(createItem({ notes: 'Sin queso' }));
      useCartStore.getState().addItem(createItem({ notes: 'Extra picante' }));
      expect(useCartStore.getState().items).toHaveLength(2);
    });

    it('añade item separado si las opciones son diferentes', () => {
      const opt1 = [{ option_id: 'o1', value_id: 'v1', option_name: 'Tamaño', value_name: 'Grande', price_adjustment: 20 }];
      const opt2 = [{ option_id: 'o1', value_id: 'v2', option_name: 'Tamaño', value_name: 'Chico', price_adjustment: 0 }];
      useCartStore.getState().addItem(createItem({ options: opt1 }));
      useCartStore.getState().addItem(createItem({ options: opt2 }));
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('elimina el item por índice', () => {
      useCartStore.getState().addItem(createItem({ product_id: 'p1' }));
      useCartStore.getState().addItem(createItem({ product_id: 'p2', notes: 'x' }));
      useCartStore.getState().removeItem(0);
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].product_id).toBe('p2');
    });
  });

  describe('updateQuantity', () => {
    it('actualiza la cantidad', () => {
      useCartStore.getState().addItem(createItem({ quantity: 1 }));
      useCartStore.getState().updateQuantity(0, 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('elimina el item si la cantidad es 0', () => {
      useCartStore.getState().addItem(createItem({ quantity: 2 }));
      useCartStore.getState().updateQuantity(0, 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('elimina el item si la cantidad es negativa', () => {
      useCartStore.getState().addItem(createItem({ quantity: 1 }));
      useCartStore.getState().updateQuantity(0, -3);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('vacía el carrito', () => {
      useCartStore.getState().addItem(createItem());
      useCartStore.getState().addItem(createItem({ notes: 'x' }));
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('getSubtotal', () => {
    it('calcula el subtotal correctamente', () => {
      useCartStore.getState().addItem(createItem({ price: 100, quantity: 2 }));
      useCartStore.getState().addItem(createItem({ product_id: 'p2', price: 50, quantity: 1 }));
      expect(useCartStore.getState().getSubtotal()).toBe(250);
    });

    it('incluye price_adjustment de opciones', () => {
      const item = createItem({
        price: 100,
        quantity: 2,
        options: [{ option_id: 'o1', value_id: 'v1', option_name: 'Tamaño', value_name: 'Grande', price_adjustment: 20 }],
      });
      useCartStore.getState().addItem(item);
      // (100 + 20) * 2 = 240
      expect(useCartStore.getState().getSubtotal()).toBe(240);
    });

    it('retorna 0 si el carrito está vacío', () => {
      expect(useCartStore.getState().getSubtotal()).toBe(0);
    });
  });
});
