import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  restaurantName: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#1c1f26',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#1c1f26',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  cardIcon: {
    fontSize: 32,
  },
  cardLabel: {
    color: '#d4d4d8',
    fontSize: 15,
    fontWeight: '600',
  },
});
