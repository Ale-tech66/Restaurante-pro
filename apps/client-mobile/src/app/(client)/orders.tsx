import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

const statusLabels: Record<string, string> = {
  nuevo: 'Recibido', aceptado: 'Aceptado', preparando: 'Preparando',
  listo: 'Listo', entregado: 'Entregado', pagado: 'Pagado', cancelado: 'Cancelado',
};
const badgeForOrderStatus: Record<string, string> = {
  nuevo: 'badgeBlue', aceptado: 'badgeOrange', preparando: 'badgeOrange',
  listo: 'badgeGreen', entregado: 'badgeGreen', pagado: 'badgeGray', cancelado: 'badgeRed',
};

export default function OrdersScreen() {
  const styles = useStyles();
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, table:tables(number)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } catch { /* silent */ }
    finally { setIsLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [user]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <Text style={styles.topBarTitle}>Mis pedidos</Text>
        <View style={{ width: 20 }} />
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>No tienes pedidos todavía.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#f97316" />}
        >
          {orders.map((o) => (
            <Pressable key={o.id} style={styles.card} onPress={() => router.push(`/(client)/order-tracking?id=${o.id}` as any)}>
              <View style={styles.cardRow}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#f4f4f5' }}>#{o.order_number}</Text>
                <Text style={[styles.badge, (styles as any)[badgeForOrderStatus[o.status]] ?? styles.badgeGray]}>
                  {statusLabels[o.status] ?? o.status}
                </Text>
              </View>
              <Text style={styles.cardSub}>{new Date(o.created_at).toLocaleString()}</Text>
              <Text style={styles.cardPrice}>${Number(o.total).toFixed(2)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
