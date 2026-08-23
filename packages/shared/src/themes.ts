// ============================================================
// Restaurante Pro — Sistema de temas compartido
// ============================================================
// 6 temas: Ember (dark premium), Minimalista, Glassmorphism,
// Bento, Editorial y Maximalismo. Cada paleta define los roles
// de color que consumen las 3 apps.

export type ThemeName =
  | 'ember'
  | 'minimalista'
  | 'glassmorphism'
  | 'bento'
  | 'editorial'
  | 'maximalismo';

export interface Palette {
  name: string;
  description: string;
  isDark: boolean;
  // Fondos
  bg: string;            // fondo de pantalla
  surface: string;       // tarjetas
  surfaceHover: string;
  border: string;
  // Texto
  text: string;
  textSecondary: string;
  textMuted: string;
  // Acento
  primary: string;
  primarySoft: string;   // fondo suave del acento
  // Estados
  success: string;
  danger: string;
  warning: string;
  info: string;
}

export const THEMES: Record<ThemeName, Palette> = {
  ember: {
    name: 'Ember',
    description: 'Dark premium · carbón y naranja',
    isDark: true,
    bg: '#0a0b0e',
    surface: 'rgba(255,255,255,0.05)',
    surfaceHover: 'rgba(255,255,255,0.09)',
    border: 'rgba(255,255,255,0.09)',
    text: '#f4f4f5',
    textSecondary: '#c4c7ce',
    textMuted: '#8b8e96',
    primary: '#f97316',
    primarySoft: 'rgba(249,115,22,0.14)',
    success: '#4ade80',
    danger: '#ef4444',
    warning: '#fbbf24',
    info: '#60a5fa',
  },
  minimalista: {
    name: 'Minimalista',
    description: 'Limpio · blanco y grafito',
    isDark: false,
    bg: '#fafafa',
    surface: '#ffffff',
    surfaceHover: '#f4f4f5',
    border: '#e5e5e5',
    text: '#18181b',
    textSecondary: '#3f3f46',
    textMuted: '#a1a1aa',
    primary: '#18181b',
    primarySoft: 'rgba(24,24,27,0.06)',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#d97706',
    info: '#2563eb',
  },
  glassmorphism: {
    name: 'Glassmorphism',
    description: 'Cristal translúcido sobre aurora',
    isDark: true,
    bg: '#1a1033',
    surface: 'rgba(255,255,255,0.10)',
    surfaceHover: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.18)',
    text: '#f8f7ff',
    textSecondary: '#ddd8f5',
    textMuted: '#a49cc9',
    primary: '#a78bfa',
    primarySoft: 'rgba(167,139,250,0.18)',
    success: '#6ee7b7',
    danger: '#fb7185',
    warning: '#fcd34d',
    info: '#93c5fd',
  },
  bento: {
    name: 'Bento',
    description: 'Tarjetas suaves estilo bento grid',
    isDark: false,
    bg: '#f2efe9',
    surface: '#ffffff',
    surfaceHover: '#faf8f4',
    border: '#e7e2d8',
    text: '#292524',
    textSecondary: '#44403c',
    textMuted: '#a8a29e',
    primary: '#0d9488',
    primarySoft: 'rgba(13,148,136,0.10)',
    success: '#059669',
    danger: '#e11d48',
    warning: '#f59e0b',
    info: '#0284c7',
  },
  editorial: {
    name: 'Editorial',
    description: 'Papel crema · tipografía clásica',
    isDark: false,
    bg: '#f7f3ec',
    surface: '#fffdf8',
    surfaceHover: '#f4efe5',
    border: '#ded5c4',
    text: '#1c1917',
    textSecondary: '#3f3a34',
    textMuted: '#9c9284',
    primary: '#b45309',
    primarySoft: 'rgba(180,83,9,0.10)',
    success: '#3f6212',
    danger: '#b91c1c',
    warning: '#a16207',
    info: '#1e40af',
  },
  maximalismo: {
    name: 'Maximalismo',
    description: 'Color vibrante sin miedo',
    isDark: true,
    bg: '#12071f',
    surface: 'rgba(236,72,153,0.10)',
    surfaceHover: 'rgba(236,72,153,0.18)',
    border: 'rgba(168,85,247,0.35)',
    text: '#fdf4ff',
    textSecondary: '#f5d0fe',
    textMuted: '#c084fc',
    primary: '#ec4899',
    primarySoft: 'rgba(236,72,153,0.20)',
    success: '#34d399',
    danger: '#f43f5e',
    warning: '#fde047',
    info: '#38bdf8',
  },
};

export const THEME_ORDER: ThemeName[] = [
  'ember',
  'minimalista',
  'glassmorphism',
  'bento',
  'editorial',
  'maximalismo',
];
