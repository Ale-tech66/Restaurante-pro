/**
 * Tests de las funciones de API (src/lib/api.ts)
 *
 * Verifica que las funciones CRUD construyan las queries de Supabase
 * correctamente y manejen errores.
 */
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
} from '@/lib/api';

// ============================================================
// Mock chain builder para supabase.from()
// ============================================================
type ChainResult = {
  data: any;
  error: any;
  count?: number | null;
};

/**
 * Crea un mock chain thenable que simula el patrón builder de Supabase:
 *   supabase.from('x').select('*').eq('a','b').order(...)
 * Termina siendo thenable (devuelve { data, error, count }).
 * .single() devuelve una Promise directa con { data, error }.
 */
function buildChain(result: ChainResult) {
  const resolved = {
    data: result.data,
    error: result.error,
    count: result.count ?? null,
  };

  // El chain es un objeto thenable (tiene .then)
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve(result)),
    // Thenable: permite await sobre el chain
    then: (resolve: any, reject?: any) => Promise.resolve(resolved).then(resolve, reject),
  };

  return chain;
}

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

// ============================================================
// Helpers
// ============================================================
function mockTable(result: ChainResult) {
  const chain = buildChain(result);
  mockFrom.mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================
// Tests - Categorías
// ============================================================
describe('API - Categorías', () => {
  it('fetchCategories debe filtrar por restaurant_id y ordenar por sort_order', async () => {
    const chain = mockTable({ data: [{ id: 'c1', name: 'Bebidas' }], error: null });

    await fetchCategories('rest-1');

    expect(mockFrom).toHaveBeenCalledWith('categories');
    expect(chain.select).toHaveBeenCalledWith('*');
    expect(chain.eq).toHaveBeenCalledWith('restaurant_id', 'rest-1');
    expect(chain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
  });

  it('fetchCategories debe lanzar si hay error', async () => {
    mockTable({ data: null, error: { message: 'RLS denied' } });

    await expect(fetchCategories('rest-1')).rejects.toMatchObject({ message: 'RLS denied' });
  });

  it('createCategory debe insertar y devolver el registro', async () => {
    const created = { id: 'c1', name: 'Postres', restaurant_id: 'rest-1' };
    const chain = mockTable({ data: created, error: null });

    const result = await createCategory({
      restaurant_id: 'rest-1',
      name: 'Postres',
    });

    expect(chain.insert).toHaveBeenCalledWith({
      restaurant_id: 'rest-1',
      name: 'Postres',
    });
    expect(result).toEqual(created);
  });

  it('updateCategory debe actualizar por id', async () => {
    const updated = { id: 'c1', name: 'Bebidasactualizado' };
    const chain = mockTable({ data: updated, error: null });

    const result = await updateCategory('c1', { name: 'Bebidasactualizado' });

    expect(chain.update).toHaveBeenCalledWith({ name: 'Bebidasactualizado' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'c1');
    expect(result).toEqual(updated);
  });

  it('deleteCategory debe eliminar por id', async () => {
    const chain = mockTable({ data: null, error: null });

    await deleteCategory('c1');

    expect(mockFrom).toHaveBeenCalledWith('categories');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'c1');
  });
});

// ============================================================
// Tests - Productos
// ============================================================
describe('API - Productos', () => {
  it('fetchProducts debe hacer join con categories', async () => {
    const chain = mockTable({
      data: [{ id: 'p1', name: 'Hamburguesa', category: { id: 'c1', name: 'Comida' } }],
      error: null,
    });

    await fetchProducts('rest-1');

    expect(chain.select).toHaveBeenCalledWith('*, category:categories(*)');
    expect(chain.eq).toHaveBeenCalledWith('restaurant_id', 'rest-1');
    expect(chain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
  });

  it('createProduct debe insertar todos los campos', async () => {
    const created = { id: 'p1', name: 'Pizza', price: 150 };
    const chain = mockTable({ data: created, error: null });

    await createProduct({
      restaurant_id: 'rest-1',
      category_id: 'c1',
      name: 'Pizza',
      description: 'Margarita',
      price: 150,
      is_available: true,
      is_featured: false,
    });

    expect(chain.insert).toHaveBeenCalledWith({
      restaurant_id: 'rest-1',
      category_id: 'c1',
      name: 'Pizza',
      description: 'Margarita',
      price: 150,
      is_available: true,
      is_featured: false,
    });
  });

  it('updateProduct debe actualizar los campos proporcionados', async () => {
    const chain = mockTable({ data: { id: 'p1', name: 'Nuevo' }, error: null });

    await updateProduct('p1', { name: 'Nuevo', price: 200 });

    expect(chain.update).toHaveBeenCalledWith({ name: 'Nuevo', price: 200 });
    expect(chain.eq).toHaveBeenCalledWith('id', 'p1');
  });

  it('deleteProduct debe eliminar por id', async () => {
    const chain = mockTable({ data: null, error: null });

    await deleteProduct('p1');

    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'p1');
  });
});

// ============================================================
// Tests - Mesas
// ============================================================
describe('API - Mesas', () => {
  it('fetchTables debe ordenar por number', async () => {
    const chain = mockTable({
      data: [{ id: 't1', number: '1', capacity: 4 }],
      error: null,
    });

    await fetchTables('rest-1');

    expect(chain.eq).toHaveBeenCalledWith('restaurant_id', 'rest-1');
    expect(chain.order).toHaveBeenCalledWith('number', { ascending: true });
  });

  it('createTable debe insertar con capacity por defecto', async () => {
    const chain = mockTable({ data: { id: 't1' }, error: null });

    await createTable({ restaurant_id: 'rest-1', number: 'Mesa 5' });

    expect(chain.insert).toHaveBeenCalledWith({
      restaurant_id: 'rest-1',
      number: 'Mesa 5',
    });
  });

  it('updateTable debe permitir cambiar status', async () => {
    const chain = mockTable({ data: { id: 't1', status: 'ocupada' }, error: null });

    await updateTable('t1', { status: 'ocupada' });

    expect(chain.update).toHaveBeenCalledWith({ status: 'ocupada' });
  });

  it('deleteTable debe eliminar por id', async () => {
    const chain = mockTable({ data: null, error: null });

    await deleteTable('t1');

    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 't1');
  });
});

// ============================================================
// Tests - Dashboard
// ============================================================
describe('API - Dashboard', () => {
  it('fetchDashboardStats debe calcular ventas del día y conteos', async () => {
    // Promise.all hace 4 queries: ordersToday, productsCount, tablesCount, pendingOrders
    // Cada uno usa supabase.from() → creamos 4 chains distintos
    const ordersChain = buildChain({
      data: [{ id: 'o1', total: 100 }, { id: 'o2', total: 50 }],
      error: null,
    });
    const productsChain = buildChain({ data: [], error: null, count: 15 });
    const tablesChain = buildChain({ data: [], error: null, count: 8 });
    const pendingChain = buildChain({ data: [], error: null, count: 3 });

    mockFrom
      .mockReturnValueOnce(ordersChain)
      .mockReturnValueOnce(productsChain)
      .mockReturnValueOnce(tablesChain)
      .mockReturnValueOnce(pendingChain);

    const stats = await fetchDashboardStats('rest-1');

    expect(stats).toEqual({
      ordersTodayCount: 2,
      salesToday: 150,
      productsCount: 15,
      tablesCount: 8,
      pendingOrders: 3,
    });
  });
});
