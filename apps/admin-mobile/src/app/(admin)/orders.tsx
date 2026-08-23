import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchActiveOrders, updateOrderStatus } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

const statusLabels: Record<string, string> = {
  nuevo: 'Nuevo', aceptado: 'Aceptado', preparando: 'Preparando',
  listo: 'Listo', entregado: 'Entregado', pagado: 'Pagado', cancelado: 'Cancelado',
};
const statusColors: Record<string, any> = {
  nuevo: styles.badgeBlue, aceptado: styles.badgeOrange, preparando: styles.badgeOrange,
  listo: styles.badgeGreen, entregado: styles.badgeGreen, pagado: styles.badgeGray, cancelado: styles.badgeRed,
};

export default function OrdersScreen() {
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
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch {
      // silent
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Pedidos</Text>
            <Text style={styles.headerSubtitle}>{orders.length} activos</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>No hay pedidos activos.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#f97316" />}
        >
          {orders.map((o) => (
            <View key={o.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#f4f4f5' }}>#{o.order_number}</Text>
                <Text style={[styles.badge, statusColors[o.status] ?? styles.badgeGray]}>
                  {statusLabels[o.status] ?? o.status}
                </Text>
              </View>
              <Text style={styles.cardSub}>Mesa {o.table_number ?? '—'} · {o.customer_name ?? 'Cliente'}</Text>
              {o.items?.map((item: any) => (
                <View key={item.id} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                  <Text style={{ fontWeight: '700', color: '#f4f4f5', width: 40 }}>{item.quantity}x</Text>
                  <Text style={{ flex: 1, color: '#d4d4d8', marginLeft: 8 }}>{item.product_name}</Text>
                </View>
              ))}
              <Text style={[styles.cardPrice, { marginTop: 8 }]}>${o.total.toFixed(2)}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {['aceptado', 'preparando', 'listo', 'entregado', 'cancelado'].map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => handleStatusChange(o.id, s)}
                    style={[styles.btn, o.status === s ? styles.btnPrimary : styles.btnSecondary, { paddingHorizontal: 12, paddingVertical: 6 }]}
                  >
                    <Text style={o.status === s ? styles.btnText : styles.btnTextSecondary}>{statusLabels[s]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
