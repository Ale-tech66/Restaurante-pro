import { StyleSheet } from 'react-native';

export const clientStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  // Header del restaurante
  restaurantHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f4f4f5',
    letterSpacing: -0.3,
  },
  tableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: '#1c1f26',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  tableBadgeText: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '600',
  },
  // Tabs de categorías
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1c1f26',
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  categoryTabActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  // Grid de productos
  productGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2e37',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f4f4f5',
  },
  productDesc: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f97316',
    marginTop: 4,
  },
  featuredBadge: {
    backgroundColor: '#78350f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  featuredText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: '#f97316',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  // Barra del carrito
  cartBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f97316',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cartBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cartBarSubtext: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.9,
  },
  // Estados vacíos / error
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f4f4f5',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  errorIcon: {
    fontSize: 48,
    color: '#ef4444',
    fontWeight: '800',
  },
});
