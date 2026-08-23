import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { THEMES, type Palette, type ThemeName } from '@restaurante-pro/shared';

// Persistencia del tema elegido (SecureStore funciona en iOS/Android/web*)
const storage = {
  getItem: async (name: string) => {
    try {
      return (await SecureStore.getItemAsync(name)) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {}
  },
  removeItem: async (name: string) => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {}
  },
};

interface ThemeState {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'ember',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'rp-theme',
      storage: createJSONStorage(() => storage),
    }
  )
);

/** Paleta reactiva: cambia cuando el usuario elige otro tema */
export function usePalette(): Palette {
  const theme = useThemeStore((s) => s.theme);
  return THEMES[theme];
}
