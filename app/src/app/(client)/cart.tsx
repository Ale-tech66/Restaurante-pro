import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { clientStyles as s } from '@/styles/client.styles';

export default function CartScreen() {
  const items = useCartStore((st) => st.items);
  const updateQuantity = useCartStore((st) => st.updateQuantity);
  const removeItem = useCartStore((st) => st.removeItem);
  const clearCart = useCartStore((st) => st.clearCart);
  const tableInfo = useCartStore((st) => st.tableInfo);
  const subtotal = useCartStore((st) => st.getSubtotal());
  const tax = useCartStore((st) => st.getTax());
  const total = useCartStore((st) => st.getTotal());

  const formatPrice = (n: number) => `$${n.toFixed(2)}`;

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: '#52525b' }}>🛒</Text>
          <Text style={s.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={s.emptyText}>Añade productos del menú para continuar</Text>
          <Pressable
            style={{
              backgroundColor: '#f97316',
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 12,
              marginTop: 24,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Ver menú</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleCheckout = () => {
    router.push('/(client)/checkout' as any);
  };

  const handleClearCart = () => {
    Alert.alert('Vaciar carrito', '¿Seguro que quieres quitar todos los artículos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: '#a1a1aa', fontSize: 15 }}>← Seguir pidiendo</Text>
        </Pressable>
        <Pressable onPress={handleClearCart}>
          <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '600' }}>Vaciar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        {/* Info de la mesa */}
        {tableInfo && (
          <View style={{ backgroundColor: '#1c1f26', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2a2e37' }}>
            <Text style={{ color: '#a1a1aa', fontSize: 13 }}>{tableInfo.restaurant_name}</Text>
            <Text style={{ color: '#f4f4f5', fontSize: 15, fontWeight: '600', marginTop: 2 }}>
              {tableInfo.table_number}
            </Text>
          </View>
        )}

        {/* Items */}
        {items.map((item) => {
          const optionsAdjustment = item.options.reduce((sum, o) => sum + o.price_adjustment, 0);
          const unitPrice = item.base_price + optionsAdjustment;
          const itemTotal = unitPrice * item.quantity;

          return (
            <View
              key={item.id}
              style={{
                backgroundColor: '#1c1f26',
                borderRadius: 14,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#2a2e37',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: '#f4f4f5' }}>{item.name}</Text>
                  {item.options.length > 0 && (
                    <Text style={{ fontSize: 13, color: '#a1a1aa' }}>
                      {item.options.map((o) => o.value_name ?? o.option_name).join(', ')}
                    </Text>
                  )}
                  {item.notes ? (
                    <Text style={{ fontSize: 13, color: '#71717a', fontStyle: 'italic' }}>
                      Nota: {item.notes}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#f97316' }}>
                  {formatPrice(itemTotal)}
                </Text>
              </View>

              {/* Controles de cantidad */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1115', borderRadius: 10, borderWidth: 1, borderColor: '#2a2e37' }}>
                  <Pressable
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ padding: 10 }}
                  >
                    <Text style={{ color: '#f97316', fontSize: 20, fontWeight: '800' }}>−</Text>
                  </Pressable>
                  <Text style={{ color: '#f4f4f5', fontSize: 16, fontWeight: '700', minWidth: 28, textAlign: 'center' }}>
                    {item.quantity}
                  </Text>
                  <Pressable
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ padding: 10 }}
                  >
                    <Text style={{ color: '#f97316', fontSize: 20, fontWeight: '800' }}>+</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => removeItem(item.id)}>
                  <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '600' }}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Resumen y checkout */}
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
            alignItems: 'center',
          }}
          onPress={handleCheckout}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Realizar pedido</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
