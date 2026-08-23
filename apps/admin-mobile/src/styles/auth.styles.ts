import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { Palette } from '@restaurante-pro/shared';
import { usePalette } from '@/stores/theme';

// Estilos de autenticación dinámicos por tema
const make = (t: Palette) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: t.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: t.textMuted,
    marginTop: 4,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: t.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: t.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: t.text,
    borderWidth: 1,
    borderColor: t.border,
  },
  button: {
    backgroundColor: t.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  linkText: {
    color: t.textMuted,
    fontSize: 14,
  },
  linkTextBold: {
    color: t.primary,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    color: t.text,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    color: t.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});


/** Hook: estilos de auth según el tema activo */
export function useStyles() {
  const t = usePalette();
  return useMemo(() => make(t), [t]);
}
