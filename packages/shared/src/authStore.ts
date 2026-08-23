// ============================================================
// Restaurante Pro — Auth store factory (compartido)
// ============================================================
// Cada app crea su propio store pasando su cliente Supabase.
// Esto permite que las 3 apps reutilicen la misma lógica de auth
// pero con clientes distintos (Expo SecureStore vs localStorage).

import { create, StoreApi, UseBoundStore } from 'zustand';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User, RoleName } from './types';

interface AuthState {
  user: User | null;
  role: RoleName | null;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function createAuthStore(supabase: SupabaseClient): UseBoundStore<StoreApi<AuthState>> {
  return create<AuthState>((set, get) => ({
    user: null,
    role: null,
    isLoading: false,
    isInitialized: false,

    initialize: async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          set({ isInitialized: true });
          return;
        }
        await get().refreshUser();
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        set({ isInitialized: true });
      }
    },

    refreshUser: async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        set({ user: null, role: null });
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('*, role:roles(*)')
        .eq('id', authUser.id)
        .single();
      if (error || !data) {
        set({ user: null, role: null });
        return;
      }
      set({ user: data as User, role: (data as any).role?.name ?? null });
    },

    signIn: async (email, password) => {
      set({ isLoading: true });
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await get().refreshUser();
      } finally {
        set({ isLoading: false });
      }
    },

    signUp: async (email, password, fullName) => {
      set({ isLoading: true });
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (data.session) {
          await get().refreshUser();
        }
      } finally {
        set({ isLoading: false });
      }
    },

    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'restaurante-pro://reset-password',
      });
      if (error) throw error;
    },

    signOut: async () => {
      await supabase.auth.signOut();
      set({ user: null, role: null });
    },
  }));
}
