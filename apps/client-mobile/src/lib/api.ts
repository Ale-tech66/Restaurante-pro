// ============================================================
// Restaurante Pro Client Mobile — API wrapper
// ============================================================
import { supabase } from './supabase';
import { clientApi } from '@restaurante-pro/shared';

export const fetchMenuByQrToken = (token: string) =>
  clientApi.fetchMenuByQrToken(supabase, token);

export const createClientOrder = (qrToken: string, items: any[], notes?: string) =>
  clientApi.createClientOrder(supabase, qrToken, items, notes);

export const subscribeToOrderStatus = (orderId: string, callback: (status: string) => void) =>
  clientApi.subscribeToOrderStatus(supabase, orderId, callback);

export { supabase };
