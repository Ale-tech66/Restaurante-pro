import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { createClientOrder, subscribeToOrderStatus } from '@/lib/clientApi';
import { clientStyles as s } from '@/styles/client.styles';

type CheckoutState = 'form' | 'sending' | 'success' | 'error';

export default function CheckoutScreen() {
  const items = useCartStore((st) => st.items);
  const tableInfo = useCartStore((st) => st.tableInfo);
  const clearCart = useCartStore((st) => st.clearCart);
  const subtotal = useCartStore((st) => st.getSubtotal());
  const tax = useCartStore((st) => st.getTax());
  const total = useCartStore((st) => st.getTotal());

  const [notes, setNotes] = useState('');
  const [state, setState] = useState<CheckoutState>('form');
  const [orderResult, setOrderResult] = useState<{
    order_number: number;
    order_id: string;
    total: number;
  } | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('nuevo');

  const formatPrice = (n: number) => `$${n.toFixed(2)}`;

  // Si no hay items, regresar al menú
  if (items.length === 0 && state !== 'success') {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <Text style={s.emptyTitle}>No hay artículos</Text>
          <Pressable onPress={() => router.replace('/(client)/menu' as any)} style={{ marginTop: 16 }}>
            <Text style={{ color: '#f97316', fontSize: 15 }}>Ir al menú</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!tableInfo) {
      Alert.alert('Error', 'No se identificó la mesa. Escanea el QR nuevamente.');
      return;
    }
    setState('sending');
    try {
      const result = await createClientOrder(tableInfo.qr_token, items, notes.trim() || undefined);
      setOrderResult({
        order_number: result.order_number,
        order_id: result.order_id,
        total: result.total,
      });
      // Suscribirse al estado del pedido en tiempo real
      subscribeToOrderStatus(result.order_id, (newStatus) => {
        setOrderStatus(newStatus);
      });
      clearCart();
      setState('success');
    } catch (err: any) {
      Alert.alert('Error al enviar pedido', err?.message ?? 'Intenta de nuevo');
      setState('form');
    }
  };

  // Pantalla de éxito
  if (state === 'success' && orderResult) {
    const statusLabels: Record<string, { label: string; color: string }> = {
      nuevo: { label: 'Recibido', color: '#60a5fa' },
      aceptado: { label: 'Aceptado', color: '#3b82f6' },
      preparando: { label: 'Preparando', color: '#f59e0b' },
      listo: { label: 'Listo para servir', color: '#22c55e' },
      entregado: { label: 'Entregado', color: '#16a34a' },
      pagado: { label: 'Pagado', color: '#15803d' },
      cancelado: { label: 'Cancelado', color: '#ef4444' },
    };
    const statusInfo = statusLabels[orderStatus] ?? statusLabels.nuevo;

    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <Text style={{ fontSize: 56, marginBottom: 8 }}>✓</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#f4f4f5', textAlign: 'center' }}>
            ¡Pedido enviado!
          </Text>
          <Text style={{ fontSize: 16, color: '#a1a1aa', marginTop: 8 }}>
            Pedido #{orderResult.order_number}
          </Text>

          {/* Estado del pedido en tiempo real */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#1c1f26',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              marginTop: 20,
              borderWidth: 1,
              borderColor: '#2a2e37',
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: statusInfo.color,
              }}
            />
            <Text style={{ color: '#f4f4f5', fontSize: 16, fontWeight: '600' }}>
              {statusInfo.label}
            </Text>
          </View>

          <Text style={{ color: '#a1a1aa', fontSize: 14, marginTop: 16, textAlign: 'center', lineHeight: 20 }}>
            Tu pedido fue enviado a cocina.{'\n'}
            Te avisaremos cuando cambie el estado.
          </Text>

          <Pressable
            style={{
              backgroundColor: '#f97316',
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
              marginTop: 32,
            }}
            onPress={() => router.replace('/(client)/menu' as any)}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Volver al menú</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla de formulario
  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ paddingVertical: 16 }}>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: '#a1a1aa', fontSize: 15 }}>← Volver al carrito</Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 24, fontWeight: '800', color: '#f4f4f5', marginBottom: 20 }}>
          Confirmar pedido
        </Text>

        {/* Resumen de items */}
        <View style={{ backgroundColor: '#1c1f26', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2a2e37', marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#f4f4f5', marginBottom: 12 }}>
            {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
          </Text>
          {items.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={{ flex: 1, color: '#a1a1aa', fontSize: 14 }} numberOfLines={1}>
                {item.quantity}× {item.name}
              </Text>
              <Text style={{ color: '#a1a1aa', fontSize: 14, fontWeight: '600' }}>
                {formatPrice((item.base_price + item.options.reduce((s2, o) => s2 + o.price_adjustment, 0)) * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Notas generales */}
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#d4d4d8', marginBottom: 8 }}>
          Notas para la cocina (opcional)
        </Text>
        <TextInput
          style={{
            backgroundColor: '#1c1f26',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: '#f4f4f5',
            borderWidth: 1,
            borderColor: '#2a2e37',
            minHeight: 80,
          }}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej: Todo para llevar, sin cubiertos..."
          placeholderTextColor="#52525b"
          multiline
        />
      </ScrollView>

      {/* Total y enviar */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          backgroundColor: '#1c1f26',
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: '#2a2e37',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: '#a1a1aa', fontSize: 14 }}>Subtotal</Text>
          <Text style={{ color: '#f4f4f5', fontSize: 14, fontWeight: '600' }}>{formatPrice(subtotal)}</Text>
        </View>
        {tax > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#a1a1aa', fontSize: 14 }}>Impuestos</Text>
            <Text style={{ color: '#f4f4f5', fontSize: 14, fontWeight: '600' }}>{formatPrice(tax)}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: '#f4f4f5', fontSize: 18, fontWeight: '700' }}>Total</Text>
          <Text style={{ color: '#f97316', fontSize: 20, fontWeight: '800' }}>{formatPrice(total)}</Text>
        </View>
        <Pressable
          style={{
            backgroundColor: '#f97316',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
          onPress={handleSubmit}
          disabled={state === 'sending'}
        >
          {state === 'sending' ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Enviando...</Text>
            </>
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Enviar pedido</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
