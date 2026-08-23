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
  fetchDashboardStats,
  fetchUsers,
  fetchRoles,
  inviteStaffUser,
} from '../src/adminApi';

// ============================================================
// Helper: crear un mock de SupabaseClient
// ============================================================
function createMockSupabase(overrides: Record<string, any> = {}) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  const supabase: any = {
    from: jest.fn(() => chain),
    rpc: jest.fn(),
    ...overrides,
  };

  return { supabase, chain };
}

describe('adminApi — Categorías', () => {
  it('fetchCategories retorna data ordenada', async () => {
    const { supabase, chain } = createMockSupabase();
    chain.single.mockResolvedValue({ data: null, error: null });
    const mockData = [{ id: '1', name: 'Bebidas' }];
    // Simular respuesta del query
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({ data: mockData, error: null })),
        })),
      })),
    });

    const result = await fetchCategories(supabase, 'rest-1');
    expect(result).toEqual(mockData);
  });

  it('createCategory inserta y retorna single', async () => {
    const { supabase, chain } = createMockSupabase();
    const newCategory = { id: '2', name: 'Postres' };
    supabase.from.mockReturnValueOnce({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ data: newCategory, error: null })),
        })),
      })),
    });

    const result = await createCategory(supabase, { restaurant_id: 'r1', name: 'Postres' });
    expect(result).toEqual(newCategory);
  });

  it('deleteCategory elimina por id', async () => {
    const { supabase, chain } = createMockSupabase();
    supabase.from.mockReturnValueOnce({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    });

    await expect(deleteCategory(supabase, 'cat-1')).resolves.toBeUndefined();
  });

  it('fetchCategories lanza error si supabase falla', async () => {
    const { supabase } = createMockSupabase();
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({ data: null, error: { message: 'DB error' } })),
        })),
      })),
    });

    await expect(fetchCategories(supabase, 'r1')).rejects.toEqual({ message: 'DB error' });
  });
});

describe('adminApi — Productos', () => {
  it('fetchProducts retorna productos con categoría', async () => {
    const { supabase } = createMockSupabase();
    const products = [{ id: 'p1', name: 'Pizza', category: { name: 'Comidas' } }];
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({ data: products, error: null })),
        })),
      })),
    });

    const result = await fetchProducts(supabase, 'r1');
    expect(result).toEqual(products);
  });

  it('createProduct inserta y retorna single', async () => {
    const { supabase } = createMockSupabase();
    const created = { id: 'p2', name: 'Hamburguesa' };
    supabase.from.mockReturnValueOnce({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ data: created, error: null })),
        })),
      })),
    });

    const result = await createProduct(supabase, {
      restaurant_id: 'r1',
      category_id: null,
      name: 'Hamburguesa',
      price: 15.5,
    });
    expect(result).toEqual(created);
  });

  it('updateProduct actualiza y retorna single', async () => {
    const { supabase } = createMockSupabase();
    const updated = { id: 'p1', name: 'Pizza Grande' };
    supabase.from.mockReturnValueOnce({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: updated, error: null })),
          })),
        })),
      })),
    });

    const result = await updateProduct(supabase, 'p1', { name: 'Pizza Grande' });
    expect(result).toEqual(updated);
  });

  it('deleteProduct elimina sin error', async () => {
    const { supabase } = createMockSupabase();
    supabase.from.mockReturnValueOnce({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    });

    await expect(deleteProduct(supabase, 'p1')).resolves.toBeUndefined();
  });
});

describe('adminApi — Mesas', () => {
  it('fetchTables retorna mesas ordenadas', async () => {
    const { supabase } = createMockSupabase();
    const tables = [{ id: 't1', number: '1', status: 'libre' }];
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({ data: tables, error: null })),
        })),
      })),
    });

    const result = await fetchTables(supabase, 'r1');
    expect(result).toEqual(tables);
  });

  it('createTable inserta y retorna single', async () => {
    const { supabase } = createMockSupabase();
    const created = { id: 't2', number: '5', capacity: 4 };
    supabase.from.mockReturnValueOnce({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ data: created, error: null })),
        })),
      })),
    });

    const result = await createTable(supabase, { restaurant_id: 'r1', number: '5' });
    expect(result).toEqual(created);
  });

  it('updateTable actualiza el estado', async () => {
    const { supabase } = createMockSupabase();
    const updated = { id: 't1', status: 'ocupada' };
    supabase.from.mockReturnValueOnce({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: updated, error: null })),
          })),
        })),
      })),
    });

    const result = await updateTable(supabase, 't1', { status: 'ocupada' });
    expect(result).toEqual(updated);
  });

  it('deleteTable elimina sin error', async () => {
    const { supabase } = createMockSupabase();
    supabase.from.mockReturnValueOnce({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    });

    await expect(deleteTable(supabase, 't1')).resolves.toBeUndefined();
  });
});

describe('adminApi — Dashboard', () => {
  it('fetchDashboardStats retorna estadísticas calculadas', async () => {
    const { supabase } = createMockSupabase();
    const ordersRes = { data: [{ id: 'o1', total: 50 }, { id: 'o2', total: 30 }], error: null };
    const productsRes = { count: 15, error: null, data: null };
    const tablesRes = { count: 8, error: null, data: null };
    const pendingRes = { count: 3, error: null, data: null };

    // Promise.all hace 4 queries en paralelo
    supabase.from
      .mockReturnValueOnce({ select: () => ({ eq: () => ({ gte: () => ordersRes }) }) })
      .mockReturnValueOnce({ select: () => ({ eq: () => productsRes }) })
      .mockReturnValueOnce({ select: () => ({ eq: () => tablesRes }) })
      .mockReturnValueOnce({ select: () => ({ eq: () => ({ in: () => pendingRes }) }) });

    const result = await fetchDashboardStats(supabase, 'r1');
    expect(result).toEqual({
      ordersTodayCount: 2,
      salesToday: 80,
      productsCount: 15,
      tablesCount: 8,
      pendingOrders: 3,
    });
  });

  it('fetchDashboardStats con 0 pedidos hoy', async () => {
    const { supabase } = createMockSupabase();
    supabase.from
      .mockReturnValueOnce({ select: () => ({ eq: () => ({ gte: () => ({ data: [], error: null }) }) }) })
      .mockReturnValueOnce({ select: () => ({ eq: () => { return { count: 0, error: null, data: null }; } }) })
      .mockReturnValueOnce({ select: () => ({ eq: () => { return { count: 0, error: null, data: null }; } }) })
      .mockReturnValueOnce({ select: () => ({ eq: () => ({ in: () => { return { count: 0, error: null, data: null }; } }) }) });

    const result = await fetchDashboardStats(supabase, 'r1');
    expect(result.ordersTodayCount).toBe(0);
    expect(result.salesToday).toBe(0);
  });
});

describe('adminApi — Usuarios', () => {
  it('fetchUsers retorna usuarios con rol', async () => {
    const { supabase } = createMockSupabase();
    const users = [{ id: 'u1', full_name: 'Juan', role: { name: 'admin' } }];
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({ data: users, error: null })),
        })),
      })),
    });

    const result = await fetchUsers(supabase, 'r1');
    expect(result).toEqual(users);
  });

  it('fetchRoles retorna roles ordenados', async () => {
    const { supabase } = createMockSupabase();
    const roles = [{ id: '1', name: 'admin' }, { id: '2', name: 'mesero' }];
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        order: jest.fn(() => ({ data: roles, error: null })),
      })),
    });

    const result = await fetchRoles(supabase);
    expect(result).toEqual(roles);
  });

  it('inviteStaffUser llama al RPC con params correctos', async () => {
    const { supabase } = createMockSupabase();
    supabase.rpc.mockResolvedValue({ data: { success: true }, error: null });

    const result = await inviteStaffUser(supabase, {
      email: 'test@test.com',
      fullName: 'Test User',
      roleName: 'mesero',
      restaurantId: 'r1',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('invite_staff_user', {
      p_email: 'test@test.com',
      p_full_name: 'Test User',
      p_role: 'mesero',
      p_restaurant_id: 'r1',
    });
    expect(result).toEqual({ success: true });
  });

  it('inviteStaffUser lanza error si el RPC falla', async () => {
    const { supabase } = createMockSupabase();
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'Ya existe' } });

    await expect(
      inviteStaffUser(supabase, {
        email: 'test@test.com',
        fullName: 'Test',
        roleName: 'cocina',
        restaurantId: 'r1',
      })
    ).rejects.toEqual({ message: 'Ya existe' });
  });
});
