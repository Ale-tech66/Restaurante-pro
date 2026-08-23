import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
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
    color: '#f4f4f5',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginTop: 4,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4d4d8',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1c1f26',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  button: {
    backgroundColor: '#f97316',
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
    color: '#a1a1aa',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#f97316',
    fontWeight: '700',
  },
  // Home / search
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#16181d',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2e37',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  topBarSub: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  // Cards
  card: {
    backgroundColor: '#1c1f26',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f97316',
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
  badgeGreen: { backgroundColor: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  badgeOrange: { backgroundColor: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  badgeRed: { backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' },
  badgeBlue: { backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  badgeGray: { backgroundColor: 'rgba(113,113,122,0.15)', color: '#a1a1aa' },
  // Buttons
  btn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: '#f97316' },
  btnSecondary: { backgroundColor: '#262a33', borderWidth: 1, borderColor: '#2a2e37' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btnTextSecondary: { color: '#a1a1aa', fontSize: 14, fontWeight: '600' },
  // Empty / loading / error
  empty: { textAlign: 'center', color: '#71717a', fontSize: 15, paddingVertical: 60 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#a1a1aa', marginTop: 12, fontSize: 14 },
  error: {
    color: '#fca5a5', backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 14, fontSize: 14,
    marginHorizontal: 16, marginTop: 12,
  },
  // FAB
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#f97316', justifyContent: 'center',
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  // Product image placeholder
  productImage: {
    width: '100%', height: 120, borderRadius: 8, backgroundColor: '#262a33',
    marginBottom: 8, justifyContent: 'center', alignItems: 'center',
  },
  productImageText: { fontSize: 32 },
  // Cart
  cartItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#262a33',
    justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { color: '#f4f4f5', fontSize: 18, fontWeight: '700' },
  qtyValue: { color: '#f4f4f5', fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  // Total bar
  totalBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#16181d', borderTopWidth: 1, borderTopColor: '#2a2e37',
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: 14, color: '#a1a1aa' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#f4f4f5' },
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
  statusCircleActive: { backgroundColor: '#f97316' },
  statusCircleDone: { backgroundColor: '#4ade80' },
  statusCirclePending: { backgroundColor: '#2a2e37' },
  statusStepText: { fontSize: 11, color: '#71717a', textAlign: 'center' },
  statusStepTextActive: { fontSize: 11, color: '#f97316', fontWeight: '700', textAlign: 'center' },
  // Category chips
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1c1f26', borderWidth: 1, borderColor: '#2a2e37',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#f97316', borderWidth: 1, borderColor: '#f97316',
  },
  categoryChipText: { fontSize: 14, color: '#a1a1aa', fontWeight: '600' },
  categoryChipTextActive: { fontSize: 14, color: '#fff', fontWeight: '700' },
});
