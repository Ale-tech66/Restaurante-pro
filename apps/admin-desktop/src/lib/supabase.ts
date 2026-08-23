import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL || (globalThis as any).VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY || (globalThis as any).VITE_SUPABASE_ANON_KEY || '';

// Reintentos automáticos ante fallos de red o 5xx del gateway
// (redes con IPv6 roto / Supabase free "frío" devuelven 504 al despertar)
const fetchWithRetry: typeof fetch = async (input, init) => {
  let lastError: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(input, init);
      if (res.status >= 500 || res.status === 429) {
        if (attempt === 2) return res;
        await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    }
  }
  throw lastError;
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase: faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env y completa tus claves.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetchWithRetry,
  },
});
