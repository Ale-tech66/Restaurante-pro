import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { createClientOrder } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

export default function CheckoutScreen() {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const qrToken = useCartStore((s) => s.qrToken);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const clearCart = useCartStore((s) => s.clearCart);

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const tax = subtotal * 0.15; // TODO: usar tax_rate del restaurante
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!qrToken) {
      Alert.alert('Error', 'No se ha escaneado un QR. Vuelve a escanear.');
      return;
    }
    setLoading(true);
    try {
      const cartItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        notes: item.notes,
        options: item.options.map((o) => ({ option_id: o.option_id, value_id: o.value_id })),
      }));
      const result = await createClientOrder(qrToken, cartItems, notes.trim() || undefined);
      clearCart();
      router.replace(`/(client)/order-tracking?id=${result.order_id}` as any);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.empty}>Tu carrito está vacío.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <Text style={styles.topBarTitle}>Checkout</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
        {restaurantName && (
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#f97316' }]}>
            <Text style={styles.cardTitle}>{restaurantName}</Text>
            {tableNumber && tableNumber !== '—' && <Text style={styles.cardSub}>Mesa {tableNumber}</Text>}
          </View>
        )}

        {/* Resumen */}
        <Text style={[styles.label, { marginTop: 16 }]}>Resumen del pedido</Text>
        {items.map((item, i) => (
          <View key={i} style={[styles.card, { paddingVertical: 10 }]}>
            <View style={styles.cardRow}>
              <Text style={{ color: '#f4f4f5', fontSize: 15 }}>{item.quantity}x {item.name}</Text>
              <Text style={{ color: '#f97316', fontWeight: '700' }}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}

        {/* Totales */}
        <View style={[styles.card, { marginTop: 8 }]}>
          <View style={styles.cardRow}>
            <Text style={styles.cardSub}>Subtotal</Text>
            <Text style={{ color: '#f4f4f5', fontWeight: '600' }}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={[styles.cardRow, { marginTop: 8 }]}>
            <Text style={styles.cardSub}>Impuesto (15%)</Text>
            <Text style={{ color: '#f4f4f5', fontWeight: '600' }}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.cardRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2a2e37' }]}>
            <Text style={{ color: '#f4f4f5', fontSize: 18, fontWeight: '800' }}>Total</Text>
            <Text style={{ color: '#f97316', fontSize: 22, fontWeight: '800' }}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notas */}
        <Text style={[styles.label, { marginTop: 16 }]}>Observaciones del pedido</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej: sin cebolla, poca sal..."
          placeholderTextColor="#71717a"
          multiline
        />

        {/* Método de pago */}
        <Text style={[styles.label, { marginTop: 16 }]}>Método de pago</Text>
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#4ade80' }]}>
          <Text style={styles.cardTitle}>Pago en caja</Text>
          <Text style={styles.cardSub}>Pagarás directamente en el restaurante</Text>
        </View>
      </ScrollView>

      {/* Botón confirmar */}
      <View style={styles.totalBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <Pressable
          style={[styles.btn, styles.btnPrimary, { paddingHorizontal: 32, paddingVertical: 14, opacity: loading ? 0.5 : 1 }]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirmar pedido</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
