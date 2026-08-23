import { createSupabaseClient } from '../src/supabase';

// ============================================================
// shared — createSupabaseClient
// ============================================================

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: jest.fn((key: string) => Promise.resolve(map.get(key) ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      map.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      map.delete(key);
      return Promise.resolve();
    }),
    _map: map,
  };
}

describe('createSupabaseClient', () => {
  it('lanza error si falta la URL', () => {
    const storage = createMemoryStorage();
    expect(() => createSupabaseClient('', 'anon-key', storage)).toThrow();
  });

  it('lanza error si falta la anon key', () => {
    const storage = createMemoryStorage();
    expect(() => createSupabaseClient('https://test.supabase.co', '', storage)).toThrow();
  });

  it('crea un cliente con auth funcional usando el storage adapter', () => {
    const storage = createMemoryStorage();
    const client = createSupabaseClient('https://test.supabase.co', 'anon-key', storage);

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    // Métodos esenciales del contrato que las apps usan vía createAuthStore
    expect(typeof client.auth.getSession).toBe('function');
    expect(typeof client.auth.getUser).toBe('function');
    expect(typeof client.auth.signInWithPassword).toBe('function');
  });
});
