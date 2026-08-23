import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { clientStyles as s } from '@/styles/client.styles';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ product_id: string }>();
  const productId = params.product_id;
  const menuData = useCartStore((st) => st.menuData);
  const addItem = useCartStore((st) => st.addItem);

  const currentProduct = useMemo(
    () => menuData?.products.find((p) => p.id === productId) ?? null,
    [menuData, productId]
  );

  const productOptions = useMemo(
    () =>
      menuData
        ? menuData.product_options.filter((o) => o.product_id === productId)
        : [],
    [menuData, productId]
  );

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const selectedAdjustment = useMemo(() => {
    let total = 0;
    for (const opt of productOptions) {
      const selectedValueId = selectedOptions[opt.id];
      if (selectedValueId) {
        const val = menuData?.product_option_values.find(
          (v) => v.id === selectedValueId
        );
        if (val) total += val.price_adjustment;
      } else if (selectedOptions[opt.id] === 'on') {
        total += opt.price_adjustment;
      }
    }
    return total;
  }, [productOptions, menuData, selectedOptions]);

  if (!currentProduct) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <Text style={s.emptyTitle}>Producto no encontrado</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: '#f97316', fontSize: 15 }}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const basePrice = currentProduct.price;
  const unitPrice = basePrice + selectedAdjustment;
  const total = unitPrice * quantity;
  const formatPrice = (n: number) => `$${n.toFixed(2)}`;

  const handleAddToCart = () => {
    const cartOptions: {
      option_id: string;
      value_id: string | null;
      option_name: string;
      value_name: string | null;
      price_adjustment: number;
    }[] = [];
    for (const opt of productOptions) {
      const selectedValueId = selectedOptions[opt.id];
      if (selectedValueId && selectedValueId !== 'on') {
        const val = menuData?.product_option_values.find(
          (v) => v.id === selectedValueId
        );
        if (val) {
          cartOptions.push({
            option_id: opt.id,
            value_id: val.id,
            option_name: opt.name,
            value_name: val.name,
            price_adjustment: val.price_adjustment,
          });
        }
      } else if (selectedValueId === 'on') {
        cartOptions.push({
          option_id: opt.id,
          value_id: null,
          option_name: opt.name,
          value_name: null,
          price_adjustment: opt.price_adjustment,
        });
      }
    }

    addItem({
      product_id: productId,
      name: currentProduct.name,
      base_price: basePrice,
      quantity,
      notes: notes.trim(),
      options: cartOptions,
    });

    Alert.alert('Añadido', `${quantity} × ${currentProduct.name} añadido al carrito`, [
      { text: 'Seguir pidiendo', onPress: () => router.back() },
      { text: 'Ver carrito', onPress: () => router.push('/(client)/cart' as any) },
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Pressable onPress={() => router.back()} style={{ paddingVertical: 8 }}>
            <Text style={{ color: '#a1a1aa', fontSize: 15 }}>← Volver</Text>
          </Pressable>
        </View>

        {/* Info del producto */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#f4f4f5' }}>
            {currentProduct.name}
          </Text>
          {currentProduct.description ? (
            <Text style={{ fontSize: 15, color: '#a1a1aa', marginTop: 8, lineHeight: 22 }}>
              {currentProduct.description}
            </Text>
          ) : null}
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#f97316', marginTop: 12 }}>
            {formatPrice(unitPrice)}
          </Text>
        </View>

        {/* Opciones */}
        {productOptions.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#f4f4f5', marginBottom: 12 }}>
              Personaliza tu pedido
            </Text>
            {productOptions.map((opt) => {
              const values = menuData
                ? menuData.product_option_values.filter(
                    (v) => v.product_option_id === opt.id
                  )
                : [];
              return (
                <View key={opt.id} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#d4d4d8', marginBottom: 8 }}>
                    {opt.name}
                    {opt.is_required ? ' (Obligatorio)' : ''}
                    {opt.price_adjustment > 0 && values.length === 0
                      ? ` +${formatPrice(opt.price_adjustment)}`
                      : ''}
                  </Text>
                  {values.length > 0 ? (
                    values.map((val) => (
                      <Pressable
                        key={val.id}
                        onPress={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [opt.id]: prev[opt.id] === val.id ? '' : val.id,
                          }))
                        }
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          backgroundColor: '#1c1f26',
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: selectedOptions[opt.id] === val.id ? '#f97316' : '#2a2e37',
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: '#f4f4f5', fontSize: 15 }}>{val.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {val.price_adjustment > 0 && (
                            <Text style={{ color: '#a1a1aa', fontSize: 14 }}>
                              +{formatPrice(val.price_adjustment)}
                            </Text>
                          )}
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              borderWidth: 2,
                              borderColor: selectedOptions[opt.id] === val.id ? '#f97316' : '#52525b',
                              backgroundColor: selectedOptions[opt.id] === val.id ? '#f97316' : 'transparent',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          />
                        </View>
                      </Pressable>
                    ))
                  ) : (
                    <Pressable
                      onPress={() =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [opt.id]: prev[opt.id] === 'on' ? '' : 'on',
                        }))
                      }
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: '#1c1f26',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: selectedOptions[opt.id] === 'on' ? '#f97316' : '#2a2e37',
                      }}
                    >
                      <Text style={{ color: '#f4f4f5', fontSize: 15 }}>Si, agregar</Text>
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          borderWidth: 2,
                          borderColor: selectedOptions[opt.id] === 'on' ? '#f97316' : '#52525b',
                          backgroundColor: selectedOptions[opt.id] === 'on' ? '#f97316' : 'transparent',
                        }}
                      />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Notas */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#d4d4d8', marginBottom: 8 }}>
            Notas (opcional)
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
            }}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ej: Sin cebolla, termino medio..."
            placeholderTextColor="#52525b"
            multiline
          />
        </View>
      </ScrollView>

      {/* Barra inferior: cantidad + añadir */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1c1f26',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#2a2e37',
          }}
        >
          <Pressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            style={{ padding: 14 }}
          >
            <Text style={{ color: '#f97316', fontSize: 22, fontWeight: '800' }}>−</Text>
          </Pressable>
          <Text style={{ color: '#f4f4f5', fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' }}>
            {quantity}
          </Text>
          <Pressable
            onPress={() => setQuantity((q) => q + 1)}
            style={{ padding: 14 }}
          >
            <Text style={{ color: '#f97316', fontSize: 22, fontWeight: '800' }}>+</Text>
          </Pressable>
        </View>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: '#f97316',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
          onPress={handleAddToCart}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Añadir</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{formatPrice(total)}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
