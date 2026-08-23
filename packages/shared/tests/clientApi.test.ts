import {
  fetchMenuByQrToken,
  createClientOrder,
  subscribeToOrderStatus,
} from '../src/clientApi';

// ============================================================
// Helper: mock de SupabaseClient
// ============================================================
function createMockSupabase() {
  const supabase: any = {
    rpc: jest.fn(),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
    removeChannel: jest.fn(),
  };
  return supabase;
}

describe('clientApi — fetchMenuByQrToken', () => {
  it('retorna el menú si el RPC funciona', async () => {
    const supabase = createMockSupabase();
    const mockMenu = {
      restaurant_id: 'r1',
      restaurant_name: 'Mi Restaurante',
      restaurant_logo: null,
      currency: 'MXN',
      tax_rate: 0.16,
      table_id: 't1',
      table_number: '5',
      categories: [{ id: 'c1', name: 'Comidas', sort_order: 1 }],
      products: [{ id: 'p1', category_id: 'c1', name: 'Pizza', description: null, price: 100, image_url: null, is_featured: true, sort_order: 1 }],
      product_options: [],
      product_option_values: [],
    };
    supabase.rpc.mockResolvedValue({ data: mockMenu, error: null });

    const result = await fetchMenuByQrToken(supabase, 'valid-token');
    expect(result).toEqual(mockMenu);
    expect(supabase.rpc).toHaveBeenCalledWith('get_menu_by_qr_token', { p_token: 'valid-token' });
  });

  it('lanza error si el RPC falla', async () => {
    const supabase = createMockSupabase();
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'Invalid token' } });

    await expect(fetchMenuByQrToken(supabase, 'bad-token')).rejects.toEqual({ message: 'Invalid token' });
  });
});

describe('clientApi — createClientOrder', () => {
  it('crea el pedido y retorna el resultado', async () => {
    const supabase = createMockSupabase();
    const mockResult = {
      order_id: 'o1',
      order_number: 42,
      subtotal: 100,
      tax_amount: 16,
      total: 116,
    };
    supabase.rpc.mockResolvedValue({ data: mockResult, error: null });

    const items = [
      { product_id: 'p1', quantity: 2, notes: 'Sin queso', options: [{ option_id: 'opt1', value_id: 'val1' }] },
    ];

    const result = await createClientOrder(supabase, 'qr-token', items, 'Entrega rápida');

    expect(result).toEqual(mockResult);
    expect(supabase.rpc).toHaveBeenCalledWith('create_client_order', {
      p_qr_token: 'qr-token',
      p_items: [
        {
          product_id: 'p1',
          quantity: 2,
          notes: 'Sin queso',
          options: [{ option_id: 'opt1', value_id: 'val1' }],
        },
      ],
      p_notes: 'Entrega rápida',
    });
  });

  it('convierte notes vacías a null', async () => {
    const supabase = createMockSupabase();
    supabase.rpc.mockResolvedValue({ data: { order_id: 'o1', order_number: 1, subtotal: 50, tax_amount: 8, total: 58 }, error: null });

    await createClientOrder(supabase, 'token', [{ product_id: 'p1', quantity: 1, notes: '', options: [] }]);

    expect(supabase.rpc).toHaveBeenCalledWith(
      'create_client_order',
      expect.objectContaining({
        p_items: [expect.objectContaining({ notes: null })],
        p_notes: null,
      })
    );
  });

  it('lanza error si el RPC falla', async () => {
    const supabase = createMockSupabase();
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'QR expirado' } });

    await expect(createClientOrder(supabase, 'expired', [])).rejects.toEqual({ message: 'QR expirado' });
  });
});

describe('clientApi — subscribeToOrderStatus', () => {
  it('crea un canal y retorna función de unsubscribe', () => {
    const supabase = createMockSupabase();
    const callback = jest.fn();
    const unsubscribe = subscribeToOrderStatus(supabase, 'o1', callback);

    expect(supabase.channel).toHaveBeenCalledWith('order-o1');
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
