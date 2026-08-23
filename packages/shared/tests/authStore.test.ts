import { createAuthStore } from '../src/authStore';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// Helper: crear un mock de SupabaseClient con auth
// ============================================================
function createMockSupabase(authOverrides: Record<string, any> = {}) {
  const auth: any = {
    getSession: jest.fn(),
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    ...authOverrides,
  };

  const from: jest.Mock = jest.fn();

  const supabase: any = {
    auth,
    from,
  };

  return supabase as unknown as SupabaseClient;
}

describe('authStore — estado inicial', () => {
  it('tiene estado inicial correcto', () => {
    const supabase = createMockSupabase();
    const store = createAuthStore(supabase);
    const state = store.getState();

    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isInitialized).toBe(false);
  });
});

describe('authStore — initialize', () => {
  it('marca como inicializado si no hay sesión', async () => {
    const supabase = createMockSupabase({
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    });
    const store = createAuthStore(supabase);

    await store.getState().initialize();

    const state = store.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.user).toBeNull();
  });

  it('llama a refreshUser si hay sesión', async () => {
    const supabase = createMockSupabase({
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'tok' } } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
    });
    // from('users')...select...eq...single()
    supabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'u1', full_name: 'Test', role: { name: 'admin' } },
            error: null,
          }),
        })),
      })),
    })) as any;

    const store = createAuthStore(supabase);
    await store.getState().initialize();

    const state = store.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.full_name).toBe('Test');
    expect(state.role).toBe('admin');
  });

  it('maneja errores y marca como inicializado', async () => {
    const supabase = createMockSupabase({
      getSession: jest.fn().mockRejectedValue(new Error('Network error')),
    });
    const store = createAuthStore(supabase);

    // Silenciar console.error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await store.getState().initialize();

    expect(store.getState().isInitialized).toBe(true);
    spy.mockRestore();
  });
});

describe('authStore — signIn', () => {
  it('hace signIn y llama refreshUser', async () => {
    const supabase = createMockSupabase({
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
    });
    supabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'u1', full_name: 'Admin', role: { name: 'admin' } },
            error: null,
          }),
        })),
      })),
    })) as any;

    const store = createAuthStore(supabase);
    await store.getState().signIn('test@test.com', 'password123');

    const state = store.getState();
    expect(state.user?.full_name).toBe('Admin');
    expect(state.role).toBe('admin');
    expect(state.isLoading).toBe(false);
  });

  it('lanza error si signInWithPassword falla', async () => {
    const supabase = createMockSupabase({
      signInWithPassword: jest.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } }),
    });
    const store = createAuthStore(supabase);

    await expect(store.getState().signIn('bad@test.com', 'wrong')).rejects.toEqual({ message: 'Invalid credentials' });
    expect(store.getState().isLoading).toBe(false);
  });

  it('isLoading es true durante el signIn', async () => {
    let resolveSignIn: (value: any) => void;
    const signInPromise = new Promise((resolve) => { resolveSignIn = resolve; });
    const supabase = createMockSupabase({
      signInWithPassword: jest.fn().mockReturnValue(signInPromise),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    });
    const store = createAuthStore(supabase);

    const pending = store.getState().signIn('test@test.com', 'password');
    expect(store.getState().isLoading).toBe(true);

    resolveSignIn!({ error: null });
    await pending;
    expect(store.getState().isLoading).toBe(false);
  });
});

describe('authStore — signUp', () => {
  it('hace signUp y si hay sesión, llama refreshUser', async () => {
    const supabase = createMockSupabase({
      signUp: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'tok' } },
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
    });
    supabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'u1', full_name: 'Nuevo', role: { name: 'admin' } },
            error: null,
          }),
        })),
      })),
    })) as any;

    const store = createAuthStore(supabase);
    await store.getState().signUp('new@test.com', 'pass123', 'Nuevo Usuario');

    expect(store.getState().user?.full_name).toBe('Nuevo');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'pass123',
      options: { data: { full_name: 'Nuevo Usuario' } },
    });
  });

  it('hace signUp sin sesión y no llama refreshUser', async () => {
    const supabase = createMockSupabase({
      signUp: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    });
    const store = createAuthStore(supabase);

    await store.getState().signUp('new@test.com', 'pass123', 'Nuevo');

    expect(store.getState().user).toBeNull();
    expect(store.getState().isLoading).toBe(false);
  });

  it('lanza error si signUp falla', async () => {
    const supabase = createMockSupabase({
      signUp: jest.fn().mockResolvedValue({ data: null, error: { message: 'Email exists' } }),
    });
    const store = createAuthStore(supabase);

    await expect(store.getState().signUp('dup@test.com', 'pass', 'Dup')).rejects.toEqual({ message: 'Email exists' });
  });
});

describe('authStore — resetPassword', () => {
  it('llama a resetPasswordForEmail con el email', async () => {
    const supabase = createMockSupabase({
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    });
    const store = createAuthStore(supabase);

    await store.getState().resetPassword('test@test.com');

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@test.com', {
      redirectTo: 'restaurante-pro://reset-password',
    });
  });

  it('lanza error si resetPasswordForEmail falla', async () => {
    const supabase = createMockSupabase({
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: { message: 'Rate limit' } }),
    });
    const store = createAuthStore(supabase);

    await expect(store.getState().resetPassword('test@test.com')).rejects.toEqual({ message: 'Rate limit' });
  });
});

describe('authStore — signOut', () => {
  it('limpia el estado al cerrar sesión', async () => {
    const supabase = createMockSupabase({
      signOut: jest.fn().mockResolvedValue({ error: null }),
    });
    const store = createAuthStore(supabase);

    // Simular que hay un usuario logueado
    store.setState({
      user: { id: 'u1', full_name: 'Test', role_id: 'r1', restaurant_id: 'rest1', email: 't@t.com', phone: null, is_active: true, created_at: '', updated_at: '' } as any,
      role: 'admin' as any,
    });

    await store.getState().signOut();

    const state = store.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });
});

describe('authStore — refreshUser', () => {
  it('limpia el estado si no hay authUser', async () => {
    const supabase = createMockSupabase({
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    });
    const store = createAuthStore(supabase);

    await store.getState().refreshUser();

    expect(store.getState().user).toBeNull();
    expect(store.getState().role).toBeNull();
  });

  it('limpia el estado si el query de users falla', async () => {
    const supabase = createMockSupabase({
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
    });
    supabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        })),
      })),
    })) as any;

    const store = createAuthStore(supabase);
    await store.getState().refreshUser();

    expect(store.getState().user).toBeNull();
  });
});
