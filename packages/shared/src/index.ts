// ============================================================
// Restaurante Pro — Barrel de exportaciones del paquete shared
// ============================================================
// Un solo punto de entrada para que las 3 apps importen todo:
//   import { useAuthStore, fetchProducts, type Product } from '@restaurante-pro/shared';

// Tipos
export * from './types';

// Cliente Supabase
export { createSupabaseClient } from './supabase';
export type { StorageAdapter } from './supabase';

// APIs
export * as adminApi from './adminApi';
export * as staffApi from './staffApi';
export * as clientApi from './clientApi';

// Auth store (factory)
export { createAuthStore } from './authStore';
