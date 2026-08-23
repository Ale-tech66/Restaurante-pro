import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchPendingPayments, registerPayment } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

export default function CashierScreen() {
  const user = useAuthStore((s) => s.user);
  const [pending, setPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const [method, setMethod] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchPendingPayments(user.restaurant_id);
      setPending(data ?? []);
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

  const handlePay = (orderId: string, total: number) => {
    if (!user?.restaurant_id) return;
    const m = method[orderId] ?? 'efectivo';
    Alert.alert('Cobrar', `¿Confirmar pago de $${total.toFixed(2)} con ${m}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cobrar', onPress: async () => {
          setPaying(orderId);
          try {
            await registerPayment({
              order_id: orderId,
              restaurant_id: user.restaurant_id,
              method: m,
              amount: total,
            });
            setPending((prev) => prev.filter((o) => o.id !== orderId));
          } catch (err: any) {
            Alert.alert('Error', err?.message);
          } finally {
            setPaying(null);
          }
        }
      }
    ]);
  };

  const totalPendiente = pending.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Caja</Text>
            <Text style={styles.headerSubtitle}>{pending.length} pendientes · ${totalPendiente.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : pending.length === 0 ? (
        <Text style={styles.empty}>No hay pagos pendientes. ✓</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#f97316" />}
        >
          {pending.map((o) => (
            <View key={o.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#f4f4f5' }}>#{o.order_number}</Text>
                <Text style={styles.cardPrice}>${Number(o.total).toFixed(2)}</Text>
              </View>
              <Text style={styles.cardSub}>Mesa {o.table?.number ?? '—'}</Text>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {['efectivo', 'tarjeta', 'transferencia'].map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMethod({ ...method, [o.id]: m })}
                    style={[styles.btn, (method[o.id] ?? 'efectivo') === m ? styles.btnPrimary : styles.btnSecondary, { paddingHorizontal: 12, paddingVertical: 6 }]}
                  >
                    <Text style={(method[o.id] ?? 'efectivo') === m ? styles.btnText : styles.btnTextSecondary}>{m}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={[styles.btn, styles.btnPrimary, { marginTop: 12 }]}
                onPress={() => handlePay(o.id, o.total)}
                disabled={paying === o.id}
              >
                <Text style={styles.btnText}>{paying === o.id ? 'Procesando...' : 'Cobrar'}</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
