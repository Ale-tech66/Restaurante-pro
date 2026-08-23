import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { subscribeToOrderStatus, supabase } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

const STEPS = [
  { key: 'nuevo', label: 'Recibido', icon: '📋' },
  { key: 'aceptado', label: 'Aceptado', icon: '✓' },
  { key: 'preparando', label: 'Preparando', icon: '🍳' },
  { key: 'listo', label: 'Listo', icon: '✅' },
  { key: 'entregado', label: 'Entregado', icon: '🍽️' },
];

export default function OrderTrackingScreen() {
  const styles = useStyles();
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<string>('nuevo');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, status, total, table:tables(number), items:order_items(id, quantity, unit_price, product:products(name))')
          .eq('id', orderId)
          .single();
        if (data) {
          setOrder(data);
          setStatus(data.status);
        }
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    };
    load();

    // Suscripción realtime
    const unsub = subscribeToOrderStatus(orderId, (newStatus) => {
      setStatus(newStatus);
      setOrder((prev: any) => prev ? { ...prev, status: newStatus } : prev);
    });

    return () => unsub();
  }, [orderId]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === status);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.empty}>Pedido no encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.replace('/(client)/home')}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <Text style={styles.topBarTitle}>Pedido #{order.order_number}</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Estado */}
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <Text style={{ fontSize: 48 }}>{STEPS[currentStepIndex]?.icon ?? '📋'}</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#f4f4f5', marginTop: 8 }}>
            {STEPS[currentStepIndex]?.label ?? 'Procesando'}
          </Text>
          {order.table?.number && (
            <Text style={styles.cardSub}>Mesa {order.table.number}</Text>
          )}
        </View>

        {/* Tracker */}
        <View style={styles.statusTracker}>
          {STEPS.map((step, i) => {
            const isDone = i < currentStepIndex;
            const isActive = i === currentStepIndex;
            return (
              <View key={step.key} style={styles.statusStep}>
                <View style={[
                  styles.statusCircle,
                  isDone ? styles.statusCircleDone : isActive ? styles.statusCircleActive : styles.statusCirclePending,
                ]}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                    {isDone ? '✓' : i + 1}
                  </Text>
                </View>
                <Text style={isActive ? styles.statusStepTextActive : styles.statusStepText}>{step.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Detalle */}
        <Text style={[styles.label, { marginTop: 16 }]}>Detalle del pedido</Text>
        {order.items?.map((item: any) => (
          <View key={item.id} style={[styles.card, { paddingVertical: 10 }]}>
            <View style={styles.cardRow}>
              <Text style={{ color: '#f4f4f5', fontSize: 15 }}>{item.quantity}x {item.product?.name ?? 'Producto'}</Text>
              <Text style={{ color: '#f97316', fontWeight: '700' }}>${(item.unit_price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.card, { marginTop: 8 }]}>
          <View style={styles.cardRow}>
            <Text style={{ color: '#f4f4f5', fontSize: 18, fontWeight: '800' }}>Total</Text>
            <Text style={{ color: '#f97316', fontSize: 22, fontWeight: '800' }}>${Number(order.total).toFixed(2)}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.btn, styles.btnSecondary, { marginTop: 24 }]}
          onPress={() => router.replace('/(client)/home')}
        >
          <Text style={styles.btnTextSecondary}>Volver al inicio</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
