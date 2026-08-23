import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { Palette } from '@restaurante-pro/shared';
import { usePalette } from '@/stores/theme';

// Estilos compartidos dinámicos: se reconstruyen al cambiar el tema
const make = (t: Palette) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: t.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: t.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: t.textMuted,
  },
  // Cards
  card: {
    backgroundColor: t.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: t.border,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: t.text,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: t.textMuted,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: t.primary,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // Badges
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  badgeGreen: { backgroundColor: t.isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.10)', color: t.success },
  badgeOrange: { backgroundColor: t.primarySoft, color: t.primary },
  badgeRed: { backgroundColor: t.isDark ? 'rgba(239,68,68,0.15)' : 'rgba(220,38,38,0.08)', color: t.danger },
  badgeBlue: { backgroundColor: t.isDark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.08)', color: t.info },
  badgeGray: { backgroundColor: t.isDark ? 'rgba(113,113,122,0.15)' : 'rgba(113,113,122,0.12)', color: t.textMuted },
  // Buttons
  btn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: t.primary,
  },
  btnSecondary: {
    backgroundColor: t.surfaceHover,
    borderWidth: 1,
    borderColor: t.border,
  },
  btnDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: `${t.danger}55`,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnTextDanger: {
    color: t.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  btnTextSecondary: {
    color: t.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  // Formularios (modales)
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: t.textSecondary,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: t.surfaceHover,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: t.text,
    fontSize: 15,
  },
  // Empty
  empty: {
    textAlign: 'center',
    color: t.textMuted,
    fontSize: 15,
    paddingVertical: 60,
  },
  // Loading
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: t.textMuted,
    marginTop: 12,
    fontSize: 14,
  },
  // Error
  error: {
    color: '#fca5a5',
    backgroundColor: t.isDark ? 'rgba(239,68,68,0.10)' : 'rgba(220,38,38,0.08)',
    borderWidth: 1,
    borderColor: `${t.danger}55`,
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    marginHorizontal: 16,
    marginTop: 12,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: t.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: t.bg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
  },
  // KDS
  kdsCard: {
    backgroundColor: t.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: t.border,
    borderLeftWidth: 4,
    borderLeftColor: t.primary,
  },
  kdsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kdsOrderNum: {
    fontSize: 18,
    fontWeight: '800',
    color: t.text,
  },
  kdsMeta: {
    fontSize: 12,
    color: t.textMuted,
  },
  kdsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  kdsItemQty: {
    fontWeight: '700',
    color: t.text,
    width: 40,
  },
  kdsItemName: {
    flex: 1,
    color: t.text,
    fontSize: 14,
    marginLeft: 8,
  },
  kdsActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  kdsActionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

/** Hook: estilos según el tema activo (se actualizan solos) */
export function useStyles() {
  const t = usePalette();
  return useMemo(() => make(t), [t]);
}
