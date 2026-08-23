// ============================================================
// admin-desktop — Test del Auth store
// ============================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';

// Mockear supabase antes de importar el store
const mockAuth = {
  getSession: vi.fn(),
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
};

const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: mockAuth,
    from: mockFrom,
  },
}));

// Importar después del mock
import { useAuthStore } from '@/stores/auth';

describe('Auth Store — Desktop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, role: null, isLoading: false, isInitialized: false });
  });

  describe('estado inicial', () => {
    it('empieza sin usuario y no inicializado', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.role).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('initialize', () => {
    it('marca como inicializado si no hay sesión', async () => {
      mockAuth.getSession.mockResolvedValue({ data: { session: null } });
      await useAuthStore.getState().initialize();
      expect(useAuthStore.getState().isInitialized).toBe(true);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('llama a refreshUser si hay sesión', async () => {
      mockAuth.getSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
      mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'u1', full_name: 'Admin', role: { name: 'admin' } },
              error: null,
            }),
          })),
        })),
      });

      await useAuthStore.getState().initialize();
      expect(useAuthStore.getState().isInitialized).toBe(true);
      expect(useAuthStore.getState().user).not.toBeNull();
      expect(useAuthStore.getState().role).toBe('admin');
    });

    it('maneja errores y marca como inicializado', async () => {
      mockAuth.getSession.mockRejectedValue(new Error('Network'));
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await useAuthStore.getState().initialize();
      expect(useAuthStore.getState().isInitialized).toBe(true);
      spy.mockRestore();
    });
  });

  describe('signIn', () => {
    it('hace login y carga el usuario', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ error: null });
      mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'u1', full_name: 'Admin', role: { name: 'admin' } },
              error: null,
            }),
          })),
        })),
      });

      await useAuthStore.getState().signIn('test@test.com', 'pass123');

      expect(useAuthStore.getState().user?.full_name).toBe('Admin');
      expect(useAuthStore.getState().role).toBe('admin');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('lanza error si las credenciales son inválidas', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });
      await expect(useAuthStore.getState().signIn('bad@test.com', 'wrong')).rejects.toEqual({ message: 'Invalid credentials' });
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('limpia el estado', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });
      useAuthStore.setState({
        user: { id: 'u1', full_name: 'Test', role_id: 'r1', restaurant_id: 'rest1', email: 't@t.com', phone: null, is_active: true, created_at: '', updated_at: '' } as any,
        role: 'admin' as any,
      });

      await useAuthStore.getState().signOut();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().role).toBeNull();
    });
  });

  describe('refreshUser', () => {
    it('limpia el estado si no hay authUser', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: null } });
      await useAuthStore.getState().refreshUser();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('limpia el estado si el query de users falla', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          })),
        })),
      });

      await useAuthStore.getState().refreshUser();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
