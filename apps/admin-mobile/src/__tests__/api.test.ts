// ============================================================
// admin-mobile — Test del API wrapper
// ============================================================
// Verifica que el wrapper pre-bindea supabase correctamente con adminApi/staffApi

jest.mock('@restaurante-pro/shared', () => {
  const actualApi = jest.requireActual('@restaurante-pro/shared');
  return {
    ...actualApi,
    adminApi: {
      fetchCategories: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      fetchProducts: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      fetchTables: jest.fn(),
      createTable: jest.fn(),
      updateTable: jest.fn(),
      deleteTable: jest.fn(),
      fetchDashboardStats: jest.fn(),
      fetchUsers: jest.fn(),
      fetchRoles: jest.fn(),
      inviteStaffUser: jest.fn(),
    },
    staffApi: {
      fetchActiveOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
      fetchOrdersByTable: jest.fn(),
      subscribeToOrders: jest.fn(),
      fetchPendingPayments: jest.fn(),
      registerPayment: jest.fn(),
    },
  };
});

import { adminApi, staffApi } from '@restaurante-pro/shared';
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
  fetchActiveOrders,
  updateOrderStatus,
  fetchOrdersByTable,
  subscribeToOrders,
  fetchPendingPayments,
  registerPayment,
} from '@/lib/api';

describe('admin-mobile — API wrapper (admin)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetchCategories delega a adminApi con supabase', async () => {
    (adminApi.fetchCategories as jest.Mock).mockResolvedValue([]);
    await fetchCategories('r1');
    expect(adminApi.fetchCategories).toHaveBeenCalledWith(expect.anything(), 'r1');
  });

  it('createCategory delega correctamente', async () => {
    (adminApi.createCategory as jest.Mock).mockResolvedValue({ id: '1' });
    await createCategory({ restaurant_id: 'r1', name: 'Test' });
    expect(adminApi.createCategory).toHaveBeenCalledWith(expect.anything(), { restaurant_id: 'r1', name: 'Test' });
  });

  it('updateCategory delega correctamente', async () => {
    (adminApi.updateCategory as jest.Mock).mockResolvedValue({});
    await updateCategory('cat-1', { name: 'Nuevo' });
    expect(adminApi.updateCategory).toHaveBeenCalledWith(expect.anything(), 'cat-1', { name: 'Nuevo' });
  });

  it('deleteCategory delega correctamente', async () => {
    (adminApi.deleteCategory as jest.Mock).mockResolvedValue(undefined);
    await deleteCategory('cat-1');
    expect(adminApi.deleteCategory).toHaveBeenCalledWith(expect.anything(), 'cat-1');
  });

  it('fetchProducts delega a adminApi', async () => {
    (adminApi.fetchProducts as jest.Mock).mockResolvedValue([]);
    await fetchProducts('r1');
    expect(adminApi.fetchProducts).toHaveBeenCalledWith(expect.anything(), 'r1');
  });

  it('createProduct delega correctamente', async () => {
    (adminApi.createProduct as jest.Mock).mockResolvedValue({ id: 'p1' });
    await createProduct({ restaurant_id: 'r1', name: 'Pizza', price: 100 });
    expect(adminApi.createProduct).toHaveBeenCalledWith(expect.anything(), { restaurant_id: 'r1', name: 'Pizza', price: 100 });
  });

  it('updateProduct delega correctamente', async () => {
    (adminApi.updateProduct as jest.Mock).mockResolvedValue({});
    await updateProduct('p1', { name: 'Pizza Grande' });
    expect(adminApi.updateProduct).toHaveBeenCalledWith(expect.anything(), 'p1', { name: 'Pizza Grande' });
  });

  it('deleteProduct delega correctamente', async () => {
    (adminApi.deleteProduct as jest.Mock).mockResolvedValue(undefined);
    await deleteProduct('p1');
    expect(adminApi.deleteProduct).toHaveBeenCalledWith(expect.anything(), 'p1');
  });

  it('fetchTables delega a adminApi', async () => {
    (adminApi.fetchTables as jest.Mock).mockResolvedValue([]);
    await fetchTables('r1');
    expect(adminApi.fetchTables).toHaveBeenCalledWith(expect.anything(), 'r1');
  });

  it('createTable delega correctamente', async () => {
    (adminApi.createTable as jest.Mock).mockResolvedValue({ id: 't1' });
    await createTable({ restaurant_id: 'r1', number: '5' });
    expect(adminApi.createTable).toHaveBeenCalledWith(expect.anything(), { restaurant_id: 'r1', number: '5' });
  });

  it('updateTable delega correctamente', async () => {
    (adminApi.updateTable as jest.Mock).mockResolvedValue({});
    await updateTable('t1', { status: 'ocupada' });
    expect(adminApi.updateTable).toHaveBeenCalledWith(expect.anything(), 't1', { status: 'ocupada' });
  });

  it('deleteTable delega correctamente', async () => {
    (adminApi.deleteTable as jest.Mock).mockResolvedValue(undefined);
    await deleteTable('t1');
    expect(adminApi.deleteTable).toHaveBeenCalledWith(expect.anything(), 't1');
  });

  it('fetchDashboardStats delega a adminApi', async () => {
    (adminApi.fetchDashboardStats as jest.Mock).mockResolvedValue({});
    await fetchDashboardStats('r1');
    expect(adminApi.fetchDashboardStats).toHaveBeenCalledWith(expect.anything(), 'r1');
  });

  it('fetchUsers delega a adminApi', async () => {
    (adminApi.fetchUsers as jest.Mock).mockResolvedValue([]);
    await fetchUsers('r1');
    expect(adminApi.fetchUsers).toHaveBeenCalledWith(expect.anything(), 'r1');
  });

  it('fetchRoles delega a adminApi', async () => {
    (adminApi.fetchRoles as jest.Mock).mockResolvedValue([]);
    await fetchRoles();
    expect(adminApi.fetchRoles).toHaveBeenCalledWith(expect.anything());
  });

  it('inviteStaffUser delega a adminApi', async () => {
    (adminApi.inviteStaffUser as jest.Mock).mockResolvedValue({ success: true });
    await inviteStaffUser({ email: 't@t.com', fullName: 'T', roleName: 'mesero', restaurantId: 'r1' });
    expect(adminApi.inviteStaffUser).toHaveBeenCalledWith(expect.anything(), { email: 't@t.com', fullName: 'T', roleName: 'mesero', restaurantId: 'r1' });
  });
});

describe('admin-mobile — API wrapper (staff)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetchActiveOrders delega a staffApi', async () => {
    (staffApi.fetchActiveOrders as jest.Mock).mockResolvedValue([]);
    await fetchActiveOrders('r1');
    expect(staffApi.fetchActiveOrders).toHaveBeenCalledWith(expect.anything(), 'r1');
  });

  it('updateOrderStatus delega a staffApi', async () => {
    (staffApi.updateOrderStatus as jest.Mock).mockResolvedValue(undefined);
    await updateOrderStatus('o1', 'preparando');
    expect(staffApi.updateOrderStatus).toHaveBeenCalledWith(expect.anything(), 'o1', 'preparando');
  });

  it('fetchOrdersByTable delega a staffApi', async () => {
    (staffApi.fetchOrdersByTable as jest.Mock).mockResolvedValue([]);
    await fetchOrdersByTable('r1', 't1');
    expect(staffApi.fetchOrdersByTable).toHaveBeenCalledWith(expect.anything(), 'r1', 't1');
  });

  it('subscribeToOrders delega a staffApi', async () => {
    (staffApi.subscribeToOrders as jest.Mock).mockReturnValue(() => {});
    subscribeToOrders('r1', () => {});
    expect(staffApi.subscribeToOrders).toHaveBeenCalledWith(expect.anything(), 'r1', expect.any(Function));
  });

  it('fetchPendingPayments delega a staffApi', async () => {
    (staffApi.fetchPendingPayments as jest.Mock).mockResolvedValue([]);
    await fetchPendingPayments('r1');
    expect(staffApi.fetchPendingPayments).toHaveBeenCalledWith(expect.anything(), 'r1');
  });

  it('registerPayment delega a staffApi', async () => {
    (staffApi.registerPayment as jest.Mock).mockResolvedValue({ id: 'pay1' });
    await registerPayment({ order_id: 'o1', restaurant_id: 'r1', method: 'efectivo', amount: 100 });
    expect(staffApi.registerPayment).toHaveBeenCalledWith(expect.anything(), { order_id: 'o1', restaurant_id: 'r1', method: 'efectivo', amount: 100 });
  });
});
