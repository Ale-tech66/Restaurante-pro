import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchTables, createTable, updateTable, deleteTable } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

const statusColors: Record<string, any> = {
  libre: styles.badgeGreen,
  ocupada: styles.badgeOrange,
  esperando_pago: styles.badgeRed,
  reservada: styles.badgeBlue,
  fuera_servicio: styles.badgeGray,
};
const statusLabels: Record<string, string> = {
  libre: 'Libre', ocupada: 'Ocupada', esperando_pago: 'Esperando pago',
  reservada: 'Reservada', fuera_servicio: 'Fuera de servicio',
};

export default function TablesScreen() {
  const user = useAuthStore((s) => s.user);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchTables(user.restaurant_id);
      setTables(data ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setNumber(''); setCapacity('4'); setModalOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setNumber(t.number); setCapacity(t.capacity.toString()); setModalOpen(true); };

  const handleSave = async () => {
    if (!number.trim()) return;
    setSaving(true);
    try {
      const cap = parseInt(capacity) || 4;
      if (editing) {
        await updateTable(editing.id, { number: number.trim(), capacity: cap });
      } else if (user?.restaurant_id) {
        await createTable({ restaurant_id: user.restaurant_id, number: number.trim(), capacity: cap });
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar esta mesa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteTable(id); setTables((prev) => prev.filter((t) => t.id !== id)); }
        catch (err: any) { Alert.alert('Error', err?.message); }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Mesas</Text>
            <Text style={styles.headerSubtitle}>{tables.length} mesas</Text>
          </View>
        </View>
        <Pressable onPress={openNew}><Text style={{ color: '#f97316', fontSize: 28, fontWeight: '600' }}>+</Text></Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : tables.length === 0 ? (
        <Text style={styles.empty}>No hay mesas registradas.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {tables.map((t) => (
              <Pressable key={t.id} style={[styles.card, { width: '47%', flexGrow: 1 }]} onPress={() => openEdit(t)}>
                <Text style={styles.cardTitle}>Mesa {t.number}</Text>
                <Text style={styles.cardSub}>Capacidad: {t.capacity}</Text>
                <Text style={[styles.badge, statusColors[t.status] ?? styles.badgeGray, { alignSelf: 'flex-start', marginTop: 8 }]}>
                  {statusLabels[t.status] ?? t.status}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {modalOpen && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1c1f26', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#f4f4f5', marginBottom: 16 }}>
              {editing ? 'Editar mesa' : 'Nueva mesa'}
            </Text>
            <Text style={styles.label}>Número / Nombre *</Text>
            <TextInput style={styles.input} value={number} onChangeText={setNumber} placeholderTextColor="#71717a" autoFocus />
            <Text style={styles.label}>Capacidad</Text>
            <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} placeholderTextColor="#71717a" keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => setModalOpen(false)}>
                <Text style={styles.btnTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.btnText}>{saving ? '...' : 'Guardar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
