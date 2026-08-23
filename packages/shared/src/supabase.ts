// ============================================================
// Restaurante Pro — Cliente Supabase compartido
// ============================================================
// Esta función crea un cliente Supabase con el adaptador de
// almacenamiento que corresponda a cada plataforma.
// Cada app pasa su propio storage adapter.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export function createSupabaseClient(
  url: string,
  anonKey: string,
  storage: StorageAdapter
): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      storage: storage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
