import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { Palette } from '@restaurante-pro/shared';
import { usePalette } from '@/stores/theme';

// Estilos compartidos dinámicos por tema
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
  // Home / search
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: t.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: t.text,
  },
  topBarSub: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: t.primary },
  btnSecondary: { backgroundColor: t.surfaceHover, borderWidth: 1, borderColor: t.border },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btnTextSecondary: { color: t.textMuted, fontSize: 14, fontWeight: '600' },
  // Empty / loading / error
  empty: { textAlign: 'center', color: t.textMuted, fontSize: 15, paddingVertical: 60 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: t.textMuted, marginTop: 12, fontSize: 14 },
  error: {
    color: t.danger, backgroundColor: `${t.danger}55`, borderWidth: 1,
    borderColor: `${t.danger}55`, borderRadius: 8, padding: 14, fontSize: 14,
    marginHorizontal: 16, marginTop: 12,
  },
  // FAB
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: t.primary, justifyContent: 'center',
    alignItems: 'center', shadowColor: t.bg, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  // Product image placeholder
  productImage: {
    width: '100%', height: 120, borderRadius: 8, backgroundColor: t.surfaceHover,
    marginBottom: 8, justifyContent: 'center', alignItems: 'center',
  },
  productImageText: { fontSize: 32 },
  // Cart
  cartItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: t.surfaceHover,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { color: t.text, fontSize: 18, fontWeight: '700' },
  qtyValue: { color: t.text, fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  // Total bar
  totalBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: 14, color: t.textMuted },
  totalValue: { fontSize: 22, fontWeight: '800', color: t.text },
  // Order status
  statusTracker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 20, paddingHorizontal: 16,
  },
  statusStep: { alignItems: 'center', flex: 1 },
  statusCircle: {
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  statusCircleActive: { backgroundColor: t.primary },
  statusCircleDone: { backgroundColor: t.success },
  statusCirclePending: { backgroundColor: t.border },
  statusStepText: { fontSize: 11, color: t.textMuted, textAlign: 'center' },
  statusStepTextActive: { fontSize: 11, color: t.primary, fontWeight: '700', textAlign: 'center' },
  // Category chips
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: t.primary, borderWidth: 1, borderColor: t.primary,
  },
  categoryChipText: { fontSize: 14, color: t.textMuted, fontWeight: '600' },
  categoryChipTextActive: { fontSize: 14, color: '#fff', fontWeight: '700' },
});

/** Hook: estilos según el tema activo */
export function useStyles() {
  const t = usePalette();
  return useMemo(() => make(t), [t]);
}
