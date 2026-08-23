import {
  fetchActiveOrders,
  updateOrderStatus,
  fetchOrdersByTable,
  fetchPendingPayments,
  registerPayment,
  subscribeToOrders,
} from '../src/staffApi';

// ============================================================
// Helper: mock chain de supabase
// ============================================================
function createMockSupabase() {
  const chain: any = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    gte: jest.fn(() => chain),
    in: jest.fn(() => chain),
    order: jest.fn(() => chain),
    single: jest.fn(() => chain),
    then: undefined,
  };

  // Para que el último método de la cadena resuelva con data/error
  const mockReturn = (data: any, error: any = null) => {
    // Hacer que cualquier método terminal retorne la promesa
    Object.defineProperty(chain, 'then', {
      value: (resolve: any) => Promise.resolve({ data, error }).then(resolve),
      writable: true,
      configurable: true,
    });
  };

  const supabase: any = {
    from: jest.fn(() => chain),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        on: jest.fn(() => ({
          subscribe: jest.fn(),
        })),
        subscribe: jest.fn(),
      })),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
    rpc: jest.fn(),
  };

  return { supabase, chain, mockReturn };
}

describe('staffApi — fetchActiveOrders', () => {
  it('retorna [] cuando no hay pedidos', async () => {
    const { supabase, chain } = createMockSupabase();
    // Simular que el primer query retorna sin pedidos
    chain.order.mockReturnValueOnce({ data: [], error: null });

    const result = await fetchActiveOrders(supabase, 'r1');
    expect(result).toEqual([]);
  });

  it('retorna pedidos formateados con items', async () => {
    const { supabase, chain } = createMockSupabase();

    const orders = [
      { id: 'o1', order_number: 1, status: 'nuevo', table_id: 't1', table: { number: '5' }, customer: { full_name: 'Juan' }, subtotal: 100, tax_amount: 16, total: 116, notes: null, created_at: '2026-01-01' },
    ];
    const items = [
      { id: 'i1', order_id: 'o1', product_id: 'p1', quantity: 2, unit_price: 50, notes: null, product: { name: 'Pizza' } },
    ];

    // Primer query: orders
    chain.order.mockReturnValueOnce({ data: orders, error: null });
    // Segundo query: items
    chain.order.mockReturnValueOnce({ data: items, error: null });
    // Tercer query: options (no hay options porque itemIds tiene length > 0)
    // optionsMap se llena pero no hay options para este item

    const result = await fetchActiveOrders(supabase, 'r1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('o1');
    expect(result[0].table_number).toBe('5');
    expect(result[0].customer_name).toBe('Juan');
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].product_name).toBe('Pizza');
  });

  it('lanza error si el query de orders falla', async () => {
    const { supabase, chain } = createMockSupabase();
    chain.order.mockReturnValueOnce({ data: null, error: { message: 'DB error' } });

    await expect(fetchActiveOrders(supabase, 'r1')).rejects.toEqual({ message: 'DB error' });
  });
});

describe('staffApi — updateOrderStatus', () => {
  it('actualiza el estado sin error', async () => {
    const { supabase, chain } = createMockSupabase();
    chain.eq.mockReturnValueOnce({ error: null });

    await expect(updateOrderStatus(supabase, 'o1', 'preparando')).resolves.toBeUndefined();
  });

  it('lanza error si falla', async () => {
    const { supabase, chain } = createMockSupabase();
    chain.eq.mockReturnValueOnce({ error: { message: 'Not found' } });

    await expect(updateOrderStatus(supabase, 'o1', 'listo')).rejects.toEqual({ message: 'Not found' });
  });
});

describe('staffApi — fetchOrdersByTable', () => {
  it('retorna [] cuando no hay pedidos para la mesa', async () => {
    const { supabase, chain } = createMockSupabase();
    chain.order.mockReturnValueOnce({ data: [], error: null });

    const result = await fetchOrdersByTable(supabase, 'r1', 't1');
    expect(result).toEqual([]);
  });

  it('retorna pedidos formateados', async () => {
    const { supabase, chain } = createMockSupabase();
    const orders = [
      { id: 'o1', order_number: 5, status: 'pagado', table_id: 't1', table: { number: '3' }, customer: null, subtotal: 200, tax_amount: 32, total: 232, notes: 'Sin cebolla', created_at: '2026-01-01' },
    ];
    const items = [
      { id: 'i1', order_id: 'o1', product_id: 'p1', quantity: 1, unit_price: 200, notes: null, product: { name: 'Tacos' } },
    ];

    chain.order.mockReturnValueOnce({ data: orders, error: null });
    chain.order.mockReturnValueOnce({ data: items, error: null });

    const result = await fetchOrdersByTable(supabase, 'r1', 't1');
    expect(result).toHaveLength(1);
    expect(result[0].order_number).toBe(5);
    expect(result[0].customer_name).toBeNull();
    expect(result[0].items[0].product_name).toBe('Tacos');
  });
});

describe('staffApi — fetchPendingPayments', () => {
  it('retorna pedidos con status entregado', async () => {
    const { supabase, chain } = createMockSupabase();
    const payments = [
      { id: 'o1', order_number: 1, total: 100, status: 'entregado', table: { number: '1' }, created_at: '2026-01-01' },
    ];
    chain.order.mockReturnValueOnce({ data: payments, error: null });

    const result = await fetchPendingPayments(supabase, 'r1');
    expect(result).toEqual(payments);
  });

  it('lanza error si falla', async () => {
    const { supabase, chain } = createMockSupabase();
    chain.order.mockReturnValueOnce({ data: null, error: { message: 'Permission denied' } });

    await expect(fetchPendingPayments(supabase, 'r1')).rejects.toEqual({ message: 'Permission denied' });
  });
});

describe('staffApi — registerPayment', () => {
  it('inserta el pago y actualiza el pedido', async () => {
    const { supabase, chain } = createMockSupabase();
    const paymentData = { id: 'pay1', order_id: 'o1', amount: 100 };
    chain.single.mockResolvedValueOnce({ data: paymentData, error: null });
    chain.eq.mockReturnValueOnce({ error: null });

    const result = await registerPayment(supabase, {
      order_id: 'o1',
      restaurant_id: 'r1',
      method: 'efectivo',
      amount: 100,
    });

    expect(result).toEqual(paymentData);
  });

  it('lanza error si el insert falla', async () => {
    const { supabase, chain } = createMockSupabase();
    chain.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

    await expect(
      registerPayment(supabase, { order_id: 'o1', restaurant_id: 'r1', method: 'tarjeta', amount: 50 })
    ).rejects.toEqual({ message: 'Insert failed' });
  });
});

describe('staffApi — subscribeToOrders', () => {
  it('crea un canal y retorna función de unsubscribe', () => {
    const { supabase } = createMockSupabase();
    const callback = jest.fn();
    const unsubscribe = subscribeToOrders(supabase, 'r1', callback);

    expect(supabase.channel).toHaveBeenCalledWith('orders-changes');
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
