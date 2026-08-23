import { THEMES, THEME_ORDER, type ThemeName } from '@restaurante-pro/shared';
import '../styles/themes.css';

const STORAGE_KEY = 'rp-theme';

export function getStoredTheme(): ThemeName {
  const t = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return t && THEME_ORDER.includes(t) ? t : 'ember';
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

// Aplica el tema guardado antes del primer render
applyTheme(getStoredTheme());

export { THEMES, THEME_ORDER };
