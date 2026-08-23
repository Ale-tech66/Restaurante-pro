import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchActiveOrders, updateOrderStatus } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

const statusColors: Record<string, string> = {
  nuevo: '#3b82f6', aceptado: '#f97316', preparando: '#fbbf24', listo: '#4ade80',
};

export default function KitchenScreen() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchActiveOrders(user.restaurant_id);
      setOrders(data ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const advanceStatus = async (orderId: string, current: string) => {
    const next: Record<string, string> = {
      nuevo: 'aceptado', aceptado: 'preparando', preparando: 'listo', listo: 'listo',
    };
    const newStatus = next[current] ?? 'listo';
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch {
      // silent
    }
  };

  const elapsed = (createdAt: string) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Cocina</Text>
            <Text style={styles.headerSubtitle}>{orders.length} pedidos activos</Text>
          </View>
        </View>
        <Pressable onPress={load}><Text style={{ color: '#f97316', fontSize: 16 }}>↻</Text></Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>No hay pedidos en cocina.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#f97316" />}
        >
          {orders.map((o) => (
            <View key={o.id} style={[styles.kdsCard, { borderLeftColor: statusColors[o.status] ?? '#f97316' }]}>
              <View style={styles.kdsHeader}>
                <View>
                  <Text style={styles.kdsOrderNum}>#{o.order_number}</Text>
                  <Text style={styles.kdsMeta}>Mesa {o.table_number ?? '—'} · {elapsed(o.created_at)}</Text>
                </View>
                <Text style={[styles.badge, o.status === 'listo' ? styles.badgeGreen : styles.badgeOrange]}>
                  {o.status.toUpperCase()}
                </Text>
              </View>
              {o.items?.map((item: any) => (
                <View key={item.id} style={styles.kdsItem}>
                  <Text style={styles.kdsItemQty}>{item.quantity}x</Text>
                  <Text style={styles.kdsItemName}>{item.product_name}</Text>
                </View>
              ))}
              {o.notes ? (
                <Text style={{ fontSize: 13, color: '#fbbf24', marginTop: 8, fontStyle: 'italic' }}>📝 {o.notes}</Text>
              ) : null}
              {o.status !== 'listo' && (
                <Pressable
                  style={[styles.kdsActionBtn, { backgroundColor: '#f97316' }]}
                  onPress={() => advanceStatus(o.id, o.status)}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                    {o.status === 'nuevo' && 'Aceptar'}
                    {o.status === 'aceptado' && 'Empezar a preparar'}
                    {o.status === 'preparando' && 'Marcar listo ✓'}
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
