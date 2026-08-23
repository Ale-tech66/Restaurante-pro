import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

export default function ReportsScreen() {
  const user = useAuthStore((s) => s.user);
  const [range, setRange] = useState('hoy');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.restaurant_id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        let start = new Date();
        if (range === 'hoy') start.setHours(0, 0, 0, 0);
        else if (range === 'semana') start.setDate(now.getDate() - 7);
        else if (range === 'mes') start.setMonth(now.getMonth() - 1);
        const startISO = start.toISOString();

        const { data: orders } = await supabase
          .from('orders')
          .select('id, total, status, created_at')
          .eq('restaurant_id', user.restaurant_id)
          .gte('created_at', startISO)
          .order('created_at', { ascending: false });

        const orderList = orders ?? [];
        const totalSales = orderList.reduce((s, o) => s + Number(o.total), 0);
        const totalOrders = orderList.length;
        const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        const { data: payments } = await supabase
          .from('payments')
          .select('method, amount')
          .eq('restaurant_id', user.restaurant_id)
          .gte('created_at', startISO);

        const byMethod: Record<string, number> = {};
        (payments ?? []).forEach((p: any) => {
          byMethod[p.method] = (byMethod[p.method] ?? 0) + Number(p.amount);
        });

        setData({ totalSales, totalOrders, avgTicket, byMethod });
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.restaurant_id, range]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Reportes</Text>
            <Text style={styles.headerSubtitle}>Estadísticas de ventas</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 }}>
        {['hoy', 'semana', 'mes'].map((r) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            style={[styles.btn, range === r ? styles.btnPrimary : styles.btnSecondary, { paddingHorizontal: 16, paddingVertical: 8 }]}
          >
            <Text style={range === r ? styles.btnText : styles.btnTextSecondary}>
              {r === 'hoy' ? 'Hoy' : r === 'semana' ? 'Semana' : 'Mes'}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : data ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <View style={[styles.card, { width: '47%', flexGrow: 1, borderLeftWidth: 4, borderLeftColor: '#166534' }]}>
              <Text style={{ fontSize: 24 }}>💰</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#f4f4f5', marginTop: 4 }}>${data.totalSales.toFixed(2)}</Text>
              <Text style={{ fontSize: 12, color: '#a1a1aa' }}>Ventas totales</Text>
            </View>
            <View style={[styles.card, { width: '47%', flexGrow: 1, borderLeftWidth: 4, borderLeftColor: '#1e3a8a' }]}>
              <Text style={{ fontSize: 24 }}>📋</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#f4f4f5', marginTop: 4 }}>{data.totalOrders}</Text>
              <Text style={{ fontSize: 12, color: '#a1a1aa' }}>Pedidos</Text>
            </View>
            <View style={[styles.card, { width: '47%', flexGrow: 1, borderLeftWidth: 4, borderLeftColor: '#78350f' }]}>
              <Text style={{ fontSize: 24 }}>📊</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#f4f4f5', marginTop: 4 }}>${data.avgTicket.toFixed(2)}</Text>
              <Text style={{ fontSize: 12, color: '#a1a1aa' }}>Ticket promedio</Text>
            </View>
          </View>

          {Object.keys(data.byMethod).length > 0 && (
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#f4f4f5', marginBottom: 12 }}>Por método de pago</Text>
              {Object.entries(data.byMethod).map(([m, total]: any) => (
                <View key={m} style={[styles.card, styles.cardRow]}>
                  <Text style={{ color: '#d4d4d8', fontSize: 14, textTransform: 'capitalize' }}>{m}</Text>
                  <Text style={{ fontWeight: '700', color: '#f97316', fontSize: 16 }}>${total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <Text style={styles.empty}>No hay datos.</Text>
      )}
    </SafeAreaView>
  );
}
