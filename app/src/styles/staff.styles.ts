import { StyleSheet } from 'react-native';

export const staffStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2e37',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  headerCount: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1c1f26',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  refreshBtnText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
  },
  // Grid de tarjetas de pedidos
  ordersList: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  orderTime: {
    fontSize: 13,
    color: '#71717a',
  },
  tableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f1115',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tableBadgeText: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Items del pedido
  itemsList: {
    gap: 8,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  itemQtyName: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  itemQty: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '800',
    minWidth: 24,
  },
  itemName: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '600',
  },
  itemNotes: {
    color: '#71717a',
    fontSize: 13,
    fontStyle: 'italic',
    paddingLeft: 32,
  },
  itemOptions: {
    color: '#a1a1aa',
    fontSize: 13,
    paddingLeft: 32,
  },
  itemPrice: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
  // Notas generales del pedido
  orderNotes: {
    backgroundColor: '#0f1115',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  orderNotesLabel: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  orderNotesText: {
    color: '#d4d4d8',
    fontSize: 14,
  },
  // Botones de acción
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: '#f97316',
  },
  actionBtnSecondary: {
    backgroundColor: '#2a2e37',
  },
  actionBtnDanger: {
    backgroundColor: '#7f1d1d',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  // Estados vacíos
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f4f4f5',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  // Lista de mesas (mesero)
  tablesGrid: {
    padding: 16,
  },
  tableCard: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableCardNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  tableCardInfo: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 4,
  },
  tableCardOrders: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 8,
  },
});
