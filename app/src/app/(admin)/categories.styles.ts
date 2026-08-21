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
  card: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f4f4f5',
  },
  cardStatus: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 4,
  },
  empty: {
    color: '#71717a',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#1c1f26',
    borderRadius: 18,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f4f4f5',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#0f1115',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#2a2e37',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#d4d4d8',
    fontSize: 15,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
