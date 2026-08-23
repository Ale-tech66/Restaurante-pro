import { StyleSheet } from 'react-native';

// Estilos compartidos para pantallas de admin/staff móvil
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
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
    backgroundColor: '#16181d',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2e37',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  headerSubtitle: {
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
    fontSize: 14,
    fontWeight: '600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#f97316',
  },
  btnSecondary: {
    backgroundColor: '#262a33',
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  btnDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnTextDanger: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
  },
  btnTextSecondary: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
  // Formularios (modales)
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4d4d8',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#262a33',
    borderWidth: 1,
    borderColor: '#2a2e37',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: '#f4f4f5',
    fontSize: 15,
  },
  // Empty
  empty: {
    textAlign: 'center',
    color: '#71717a',
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
    color: '#a1a1aa',
    marginTop: 12,
    fontSize: 14,
  },
  // Error
  error: {
    color: '#fca5a5',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
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
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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
    backgroundColor: '#1c1f26',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2e37',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
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
    color: '#f4f4f5',
  },
  kdsMeta: {
    fontSize: 12,
    color: '#71717a',
  },
  kdsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2e37',
  },
  kdsItemQty: {
    fontWeight: '700',
    color: '#f4f4f5',
    width: 40,
  },
  kdsItemName: {
    flex: 1,
    color: '#f4f4f5',
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
