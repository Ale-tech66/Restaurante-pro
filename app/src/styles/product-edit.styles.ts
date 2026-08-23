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
  form: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4d4d8',
    marginBottom: 6,
    marginTop: 16,
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
  textArea: {
    minHeight: 80,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: '#1c1f26',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  categoryChipActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  categoryChipText: {
    color: '#d4d4d8',
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#d4d4d8',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
