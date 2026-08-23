// ============================================================
// client-mobile — Test del API wrapper
// ============================================================
jest.mock('@restaurante-pro/shared', () => ({
  ...jest.requireActual('@restaurante-pro/shared'),
  clientApi: {
    fetchMenuByQrToken: jest.fn(),
    createClientOrder: jest.fn(),
    subscribeToOrderStatus: jest.fn(),
  },
}));

import { clientApi } from '@restaurante-pro/shared';
import {
  fetchMenuByQrToken,
  createClientOrder,
  subscribeToOrderStatus,
} from '@/lib/api';

describe('client-mobile — API wrapper', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetchMenuByQrToken delega a clientApi', async () => {
    (clientApi.fetchMenuByQrToken as jest.Mock).mockResolvedValue({ restaurant_name: 'Test' });
    await fetchMenuByQrToken('token-123');
    expect(clientApi.fetchMenuByQrToken).toHaveBeenCalledWith(expect.anything(), 'token-123');
  });

  it('createClientOrder delega a clientApi', async () => {
    (clientApi.createClientOrder as jest.Mock).mockResolvedValue({ order_id: 'o1', order_number: 1 });
    const items = [{ product_id: 'p1', quantity: 2, notes: '', options: [] }];
    await createClientOrder('token', items, 'rapido');
    expect(clientApi.createClientOrder).toHaveBeenCalledWith(expect.anything(), 'token', items, 'rapido');
  });

  it('createClientOrder sin notes', async () => {
    (clientApi.createClientOrder as jest.Mock).mockResolvedValue({ order_id: 'o1', order_number: 1 });
    await createClientOrder('token', [{ product_id: 'p1', quantity: 1, notes: '', options: [] }]);
    expect(clientApi.createClientOrder).toHaveBeenCalledWith(expect.anything(), 'token', expect.any(Array), undefined);
  });

  it('subscribeToOrderStatus delega a clientApi', () => {
    (clientApi.subscribeToOrderStatus as jest.Mock).mockReturnValue(() => {});
    subscribeToOrderStatus('o1', () => {});
    expect(clientApi.subscribeToOrderStatus).toHaveBeenCalledWith(expect.anything(), 'o1', expect.any(Function));
  });
});
