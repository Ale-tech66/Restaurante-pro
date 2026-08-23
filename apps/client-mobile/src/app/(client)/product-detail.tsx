import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { supabase } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

export default function ProductDetailScreen() {
  const styles = useStyles();
  const params = useLocalSearchParams();
  const productId = params.id as string;
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      try {
        const { data: prod, error: err1 } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('id', productId)
          .single();
        if (err1) throw err1;
        setProduct(prod);

        const { data: opts } = await supabase
          .from('product_options')
          .select('id, product_id, name, type, price_adjustment, is_required, is_multi_select, sort_order')
          .eq('product_id', productId)
          .order('sort_order');
        setOptions(opts ?? []);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    const optionArray = Object.entries(selectedOptions).map(([optId, valId]) => {
      const opt = options.find((o) => o.id === optId);
      return {
        option_id: optId,
        value_id: valId || null,
        option_name: opt?.name ?? '',
        value_name: null,
        price_adjustment: opt?.price_adjustment ?? 0,
      };
    });
    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      image_url: product.image_url,
      notes: notes.trim(),
      options: optionArray,
    });
    Alert.alert('Agregado', `${product.name} añadido al carrito`);
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.empty}>Producto no encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <Text style={styles.topBarTitle}>{product.name}</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
        {/* Imagen */}
        <View style={styles.productImage}>
          <Text style={styles.productImageText}>🍽️</Text>
        </View>

        <Text style={{ fontSize: 22, fontWeight: '800', color: '#f4f4f5', marginTop: 12 }}>{product.name}</Text>
        <Text style={{ fontSize: 14, color: '#a1a1aa', marginTop: 4 }}>{product.description ?? 'Sin descripción'}</Text>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#f97316', marginTop: 8 }}>${Number(product.price).toFixed(2)}</Text>

        {/* Opciones */}
        {options.map((opt) => (
          <View key={opt.id} style={{ marginTop: 20 }}>
            <Text style={styles.label}>{opt.name} {opt.is_required ? '*' : ''}</Text>
            <Pressable
              style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              onPress={() => {
                // Toggle simple: por ahora solo marca como seleccionado
                setSelectedOptions({
                  ...selectedOptions,
                  [opt.id]: selectedOptions[opt.id] ? '' : opt.id,
                });
              }}
            >
              <Text style={{ color: selectedOptions[opt.id] ? '#f97316' : '#71717a', fontSize: 14 }}>
                {selectedOptions[opt.id] ? 'Seleccionado' : 'Tocar para seleccionar'}
              </Text>
              {opt.price_adjustment > 0 && (
                <Text style={{ color: '#a1a1aa', fontSize: 14 }}>+${opt.price_adjustment.toFixed(2)}</Text>
              )}
            </Pressable>
          </View>
        ))}

        {/* Notas */}
        <Text style={[styles.label, { marginTop: 20 }]}>Observaciones</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej: sin cebolla, término medio..."
          placeholderTextColor="#71717a"
          multiline
        />

        {/* Cantidad */}
        <Text style={[styles.label, { marginTop: 20 }]}>Cantidad</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Text style={styles.qtyText}>−</Text>
          </Pressable>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <Pressable style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.qtyText}>+</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Botón agregar */}
      <View style={styles.totalBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${(Number(product.price) * quantity).toFixed(2)}</Text>
        </View>
        <Pressable style={[styles.btn, styles.btnPrimary, { paddingHorizontal: 32, paddingVertical: 14 }]} onPress={handleAddToCart}>
          <Text style={styles.btnText}>Agregar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
