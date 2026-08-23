import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { styles } from '@/styles/shared.styles';

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const tableNumber = useCartStore((s) => s.tableNumber);

  const subtotal = getSubtotal();

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/(client)/checkout' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <Text style={styles.topBarTitle}>Carrito</Text>
        <View style={{ width: 20 }} />
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>Tu carrito está vacío.</Text>
      ) : (
        <>
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
            {restaurantName && (
              <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#f97316' }]}>
                <Text style={styles.cardTitle}>{restaurantName}</Text>
                {tableNumber && tableNumber !== '—' && <Text style={styles.cardSub}>Mesa {tableNumber}</Text>}
              </View>
            )}

            {items.map((item, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
                    {item.notes ? <Text style={[styles.cardSub, { fontStyle: 'italic' }]}>📝 {item.notes}</Text> : null}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(i, item.quantity - 1)}>
                      <Text style={styles.qtyText}>−</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(i, item.quantity + 1)}>
                      <Text style={styles.qtyText}>+</Text>
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={() => removeItem(i)} style={{ marginTop: 8 }}>
                  <Text style={{ color: '#f87171', fontSize: 13 }}>Eliminar</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totalBar}>
            <View>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <Pressable style={[styles.btn, styles.btnPrimary, { paddingHorizontal: 32, paddingVertical: 14 }]} onPress={handleCheckout}>
              <Text style={styles.btnText}>Continuar</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
