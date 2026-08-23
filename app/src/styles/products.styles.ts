import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    color: '#a1a1aa',
    fontSize: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  addBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  productInfo: {
    gap: 6,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f4f4f5',
  },
  productDesc: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f97316',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeActive: {
    backgroundColor: '#166534',
  },
  badgeInactive: {
    backgroundColor: '#7f1d1d',
  },
  badgeFeatured: {
    backgroundColor: '#78350f',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    color: '#71717a',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
  },
});
