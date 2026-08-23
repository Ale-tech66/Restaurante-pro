/**
 * Tests del store de autenticación (Zustand)
 *
 * Verifica el flujo: initialize → signIn → signOut
 * con mocks de Supabase Auth y la tabla users.
 */
import { useAuthStore } from '@/stores/auth';

// ============================================================
// Mocks
// ============================================================

// Mock de supabase con control sobre auth y from()
const mockAuthGetSession = jest.fn();
const mockAuthGetUser = jest.fn();
const mockAuthSignInWithPassword = jest.fn();
const mockAuthSignOut = jest.fn();
const mockAuthSignUp = jest.fn();
const mockAuthResetPassword = jest.fn();

const mockFromSelect = jest.fn();
const mockFromEq = jest.fn();
const mockFromSingle = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: any[]) => mockAuthGetSession(...args),
      getUser: (...args: any[]) => mockAuthGetUser(...args),
      signInWithPassword: (...args: any[]) => mockAuthSignInWithPassword(...args),
      signOut: (...args: any[]) => mockAuthSignOut(...args),
      signUp: (...args: any[]) => mockAuthSignUp(...args),
      resetPasswordForEmail: (...args: any[]) => mockAuthResetPassword(...args),
    },
    from: () => ({
      select: (...args: any[]) => {
        mockFromSelect(...args);
        return {
          eq: (...eqArgs: any[]) => {
            mockFromEq(...eqArgs);
            return { single: mockFromSingle };
          },
        };
      },
    }),
  },
}));

// ============================================================
// Helpers
// ============================================================

const mockUser = {
  id: 'user-1',
  email: 'admin@demo.com',
  restaurant_id: 'rest-1',
  role_id: 'role-admin',
  full_name: 'Admin Demo',
  phone: null,
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  role: { id: 'role-admin', name: 'admin' as const, description: null },
};

const mockAuthUser = {
  id: 'user-1',
  email: 'admin@demo.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2025-01-01T00:00:00Z',
};

// Reset del store entre tests
const resetStore = () => {
  useAuthStore.setState({
    user: null,
    role: null,
    isLoading: false,
    isInitialized: false,
  });
};

// ============================================================
// Tests
// ============================================================

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  // ----------------------------------------------------------
  // initialize()
  // ----------------------------------------------------------
  describe('initialize()', () => {
    it('debe marcar isInitialized=true sin sesión', async () => {
      mockAuthGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isInitialized).toBe(true);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().role).toBeNull();
    });

    it('debe cargar el usuario si hay sesión activa', async () => {
      mockAuthGetSession.mockResolvedValue({
        data: { session: { access_token: 'token-123' } },
        error: null,
      });
      mockAuthGetUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockFromSingle.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isInitialized).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().role).toBe('admin');
    });

    it('debe manejar errores de getSession', async () => {
      mockAuthGetSession.mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isInitialized).toBe(true);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // signIn()
  // ----------------------------------------------------------
  describe('signIn()', () => {
    it('debe iniciar sesión correctamente', async () => {
      mockAuthSignInWithPassword.mockResolvedValue({ error: null });
      mockAuthGetUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockFromSingle.mockResolvedValue({ data: mockUser, error: null });

      await useAuthStore.getState().signIn('admin@demo.com', 'password123');

      expect(mockAuthSignInWithPassword).toHaveBeenCalledWith({
        email: 'admin@demo.com',
        password: 'password123',
      });
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().role).toBe('admin');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('debe lanzar error si las credenciales son incorrectas', async () => {
      mockAuthSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        useAuthStore.getState().signIn('admin@demo.com', 'wrongpass')
      ).rejects.toMatchObject({ message: 'Invalid login credentials' });

      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('debe setear isLoading durante el login', async () => {
      let isLoadingDuringCall = false;
      mockAuthSignInWithPassword.mockImplementation(async () => {
        isLoadingDuringCall = useAuthStore.getState().isLoading;
        return { error: null };
      });
      mockAuthGetUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockFromSingle.mockResolvedValue({ data: mockUser, error: null });

      await useAuthStore.getState().signIn('admin@demo.com', 'password123');

      expect(isLoadingDuringCall).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // signOut()
  // ----------------------------------------------------------
  describe('signOut()', () => {
    it('debe cerrar sesión y limpiar el estado', async () => {
      // Primero setear un usuario
      useAuthStore.setState({ user: mockUser, role: 'admin' });
      mockAuthSignOut.mockResolvedValue({ error: null });

      await useAuthStore.getState().signOut();

      expect(mockAuthSignOut).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().role).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // refreshUser()
  // ----------------------------------------------------------
  describe('refreshUser()', () => {
    it('debe actualizar el usuario desde la BD', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockFromSingle.mockResolvedValue({ data: mockUser, error: null });

      await useAuthStore.getState().refreshUser();

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().role).toBe('admin');
    });

    it('debe limpiar el estado si auth.getUser no retorna usuario', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      useAuthStore.setState({ user: mockUser, role: 'admin' });

      await useAuthStore.getState().refreshUser();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().role).toBeNull();
    });

    it('debe limpiar el estado si la query a users falla', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockFromSingle.mockResolvedValue({ data: null, error: { message: 'no rows' } });

      await useAuthStore.getState().refreshUser();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().role).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // signUp()
  // ----------------------------------------------------------
  describe('signUp()', () => {
    it('debe registrar un nuevo usuario con email, password y fullName', async () => {
      mockAuthSignUp.mockResolvedValue({
        data: { user: { id: 'new-user', email: 'nuevo@demo.com' }, session: null },
        error: null,
      });

      await useAuthStore.getState().signUp('nuevo@demo.com', 'password123', 'Nuevo Usuario');

      expect(mockAuthSignUp).toHaveBeenCalledWith({
        email: 'nuevo@demo.com',
        password: 'password123',
        options: { data: { full_name: 'Nuevo Usuario' } },
      });
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('debe cargar el usuario si el registro devuelve sesión', async () => {
      mockAuthSignUp.mockResolvedValue({
        data: { user: mockAuthUser, session: { access_token: 'token-123' } },
        error: null,
      });
      mockAuthGetUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockFromSingle.mockResolvedValue({ data: mockUser, error: null });

      await useAuthStore.getState().signUp('admin@demo.com', 'password123', 'Admin Demo');

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().role).toBe('admin');
    });

    it('debe lanzar error si el registro falla (email ya existe)', async () => {
      mockAuthSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      await expect(
        useAuthStore.getState().signUp('admin@demo.com', 'password123', 'Admin Demo')
      ).rejects.toMatchObject({ message: 'User already registered' });

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // resetPassword()
  // ----------------------------------------------------------
  describe('resetPassword()', () => {
    it('debe enviar el correo de recuperación correctamente', async () => {
      mockAuthResetPassword.mockResolvedValue({ error: null });

      await useAuthStore.getState().resetPassword('admin@demo.com');

      expect(mockAuthResetPassword).toHaveBeenCalledWith(
        'admin@demo.com',
        { redirectTo: 'restaurante-pro://reset-password' }
      );
    });

    it('debe lanzar error si el envío falla', async () => {
      mockAuthResetPassword.mockResolvedValue({
        error: { message: 'Rate limit exceeded' },
      });

      await expect(
        useAuthStore.getState().resetPassword('admin@demo.com')
      ).rejects.toMatchObject({ message: 'Rate limit exceeded' });
    });
  });
});
