import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchTables } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

const badgeForStatus: Record<string, string> = {
  libre: 'badgeGreen', ocupada: 'badgeOrange', esperando_pago: 'badgeRed',
  reservada: 'badgeBlue', fuera_servicio: 'badgeGray',
};
const statusLabels: Record<string, string> = {
  libre: 'Libre', ocupada: 'Ocupada', esperando_pago: 'Esperando pago',
  reservada: 'Reservada', fuera_servicio: 'Fuera de servicio',
};

export default function WaiterTablesScreen() {
  const styles = useStyles();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchTables(user.restaurant_id);
      setTables(data ?? []);
    } catch { /* silent */ }
    finally { setIsLoading(false); setRefreshing(false); }
  }, [user?.restaurant_id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mesero — Mesas</Text>
          <Text style={styles.headerSubtitle}>{tables.length} mesas</Text>
        </View>
        <Pressable onPress={async () => { await signOut(); router.replace('/(auth)/login'); }}>
          <Text style={{ color: '#f87171', fontSize: 14, fontWeight: '600' }}>Salir</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : tables.length === 0 ? (
        <Text style={styles.empty}>No hay mesas asignadas.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#f97316" />}
        >
          <View style={styles.grid}>
            {tables.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.card, { width: '47%', flexGrow: 1 }]}
                onPress={() => router.push(`/(staff)/mesero/mesa/${t.id}` as any)}
              >
                <Text style={styles.cardTitle}>Mesa {t.number}</Text>
                <Text style={styles.cardSub}>Cap: {t.capacity}</Text>
                <Text style={[styles.badge, (styles as any)[badgeForStatus[t.status]] ?? styles.badgeGray, { alignSelf: 'flex-start', marginTop: 8 }]}>
                  {statusLabels[t.status] ?? t.status}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
