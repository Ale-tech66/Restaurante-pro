// ============================================================
// admin-desktop — Test de funciones API
// ============================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';

// Mock del cliente supabase
const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
    rpc: vi.fn(),
  },
}));

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchTables,
  createTable,
  updateTable,
  deleteTable,
  fetchActiveOrders,
  updateOrderStatus,
  fetchUsers,
  fetchRoles,
  inviteStaffUser,
  fetchPendingPayments,
  registerPayment,
} from '@/lib/api';

// Helper: crear cadena de mock
function chain(result: { data?: any; error?: any; count?: number }) {
  const c: any = {
    select: vi.fn(() => c),
    insert: vi.fn(() => c),
    update: vi.fn(() => c),
    delete: vi.fn(() => c),
    eq: vi.fn(() => c),
    gte: vi.fn(() => c),
    in: vi.fn(() => c),
    order: vi.fn(() => c),
    single: vi.fn(() => c),
  };
  // Hacer que el último método resuelva con result
  c.then = (resolve: any) => Promise.resolve(result).then(resolve);
  // Hacer que order y single también retornen result directamente
  c.order.mockReturnValue(result);
  c.single.mockReturnValue(result);
  return c;
}

describe('API Desktop — Categorías', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchCategories retorna data', async () => {
    const data = [{ id: 'c1', name: 'Bebidas' }];
    mockFrom.mockReturnValueOnce(chain({ data, error: null }));
    const result = await fetchCategories('r1');
    expect(result).toEqual(data);
  });

  it('createCategory inserta y retorna single', async () => {
    const created = { id: 'c2', name: 'Postres' };
    mockFrom.mockReturnValueOnce(chain({ data: created, error: null }));
    const result = await createCategory({ restaurant_id: 'r1', name: 'Postres' });
    expect(result).toEqual(created);
  });

  it('updateCategory actualiza', async () => {
    const updated = { id: 'c1', name: 'Nuevo' };
    mockFrom.mockReturnValueOnce(chain({ data: updated, error: null }));
    const result = await updateCategory('c1', { name: 'Nuevo' });
    expect(result).toEqual(updated);
  });

  it('deleteCategory elimina sin error', async () => {
    mockFrom.mockReturnValueOnce(chain({ error: null }));
    await expect(deleteCategory('c1')).resolves.toBeUndefined();
  });
});

describe('API Desktop — Productos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchProducts retorna productos con categoría', async () => {
    const data = [{ id: 'p1', name: 'Pizza', category: { name: 'Comidas' } }];
    mockFrom.mockReturnValueOnce(chain({ data, error: null }));
    const result = await fetchProducts('r1');
    expect(result).toEqual(data);
  });

  it('createProduct inserta y retorna', async () => {
    const created = { id: 'p2', name: 'Burger' };
    mockFrom.mockReturnValueOnce(chain({ data: created, error: null }));
    const result = await createProduct({ restaurant_id: 'r1', category_id: null, name: 'Burger', price: 15 });
    expect(result).toEqual(created);
  });

  it('updateProduct actualiza', async () => {
    const updated = { id: 'p1', name: 'Pizza Grande' };
    mockFrom.mockReturnValueOnce(chain({ data: updated, error: null }));
    const result = await updateProduct('p1', { name: 'Pizza Grande' });
    expect(result).toEqual(updated);
  });

  it('deleteProduct elimina sin error', async () => {
    mockFrom.mockReturnValueOnce(chain({ error: null }));
    await expect(deleteProduct('p1')).resolves.toBeUndefined();
  });
});

describe('API Desktop — Mesas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchTables retorna mesas', async () => {
    const data = [{ id: 't1', number: '1', status: 'libre' }];
    mockFrom.mockReturnValueOnce(chain({ data, error: null }));
    const result = await fetchTables('r1');
    expect(result).toEqual(data);
  });

  it('createTable inserta y retorna', async () => {
    const created = { id: 't2', number: '5' };
    mockFrom.mockReturnValueOnce(chain({ data: created, error: null }));
    const result = await createTable({ restaurant_id: 'r1', number: '5' });
    expect(result).toEqual(created);
  });

  it('updateTable actualiza estado', async () => {
    const updated = { id: 't1', status: 'ocupada' };
    mockFrom.mockReturnValueOnce(chain({ data: updated, error: null }));
    const result = await updateTable('t1', { status: 'ocupada' });
    expect(result).toEqual(updated);
  });

  it('deleteTable elimina sin error', async () => {
    mockFrom.mockReturnValueOnce(chain({ error: null }));
    await expect(deleteTable('t1')).resolves.toBeUndefined();
  });
});

describe('API Desktop — Pedidos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchActiveOrders retorna pedidos activos', async () => {
    const data = [{ id: 'o1', status: 'nuevo' }];
    mockFrom.mockReturnValueOnce(chain({ data, error: null }));
    const result = await fetchActiveOrders('r1');
    expect(result).toEqual(data);
  });

  it('updateOrderStatus actualiza sin error', async () => {
    mockFrom.mockReturnValueOnce(chain({ error: null }));
    await expect(updateOrderStatus('o1', 'preparando')).resolves.toBeUndefined();
  });
});

describe('API Desktop — Usuarios', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchUsers retorna usuarios con rol', async () => {
    const data = [{ id: 'u1', full_name: 'Juan', role: { name: 'admin' } }];
    mockFrom.mockReturnValueOnce(chain({ data, error: null }));
    const result = await fetchUsers('r1');
    expect(result).toEqual(data);
  });

  it('fetchRoles retorna roles', async () => {
    const data = [{ id: '1', name: 'admin' }];
    mockFrom.mockReturnValueOnce(chain({ data, error: null }));
    const result = await fetchRoles();
    expect(result).toEqual(data);
  });

  it('inviteStaffUser llama al RPC', async () => {
    const supabase = await import('@/lib/supabase');
    (supabase.supabase as any).rpc = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
    const result = await inviteStaffUser({ email: 't@t.com', fullName: 'T', roleName: 'mesero', restaurantId: 'r1' });
    expect(supabase.supabase.rpc).toHaveBeenCalledWith('invite_staff_user', {
      p_email: 't@t.com',
      p_full_name: 'T',
      p_role: 'mesero',
      p_restaurant_id: 'r1',
    });
    expect(result).toEqual({ success: true });
  });
});

describe('API Desktop — Pagos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchPendingPayments retorna pedidos entregados', async () => {
    const data = [{ id: 'o1', order_number: 1, total: 100, status: 'entregado' }];
    mockFrom.mockReturnValueOnce(chain({ data, error: null }));
    const result = await fetchPendingPayments('r1');
    expect(result).toEqual(data);
  });

  it('registerPayment inserta y actualiza pedido', async () => {
    const paymentData = { id: 'pay1', order_id: 'o1', amount: 100 };
    // Primer call: insert payment → single
    mockFrom.mockReturnValueOnce(chain({ data: paymentData, error: null }));
    // Segundo call: update order status
    mockFrom.mockReturnValueOnce(chain({ error: null }));

    const result = await registerPayment({ order_id: 'o1', restaurant_id: 'r1', method: 'efectivo', amount: 100 });
    expect(result).toEqual(paymentData);
  });
});
