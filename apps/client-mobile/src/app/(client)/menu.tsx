import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { fetchMenuByQrToken, supabase } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

export default function MenuScreen() {
  const params = useLocalSearchParams();
  const restaurantId = params.restaurant as string;
  const setQrContext = useCartStore((s) => s.setQrContext);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const tableNumber = useCartStore((s) => s.tableNumber);

  const [menu, setMenu] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      if (restaurantId) {
        // Búsqueda sin QR: cargar restaurante + menú directamente
        const [{ data: rest }, { data: cats }, { data: prods }] = await Promise.all([
          supabase.from('restaurants').select('id, name, currency, tax_rate').eq('id', restaurantId).single(),
          supabase.from('categories').select('id, name, sort_order').eq('restaurant_id', restaurantId).eq('is_active', true).order('sort_order'),
          supabase.from('products').select('id, category_id, name, description, price, image_url, is_available, is_featured, sort_order').eq('restaurant_id', restaurantId).order('sort_order'),
        ]);
        if (rest) setQrContext('', rest.name, '—');
        setCategories(cats ?? []);
        setProducts(prods ?? []);
      } else {
        // Vía QR token (ya en el store)
        const token = useCartStore.getState().qrToken;
        if (!token) { router.replace('/(client)/home'); return; }
        const data = await fetchMenuByQrToken(token);
        setMenu(data);
        setCategories(data.categories ?? []);
        setProducts(data.products ?? []);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar menú');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [restaurantId]);

  const filtered = activeCat === 'all' ? products : products.filter((p) => p.category_id === activeCat);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <View>
          <Text style={styles.topBarTitle}>{restaurantName ?? 'Menú'}</Text>
          {tableNumber && tableNumber !== '—' && <Text style={styles.topBarSub}>Mesa {tableNumber}</Text>}
        </View>
        <Pressable onPress={() => router.push('/(client)/cart' as any)}>
          <Text style={{ color: '#f97316', fontSize: 16 }}>🛒</Text>
        </Pressable>
      </View>

      {/* Categorías */}
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 8, maxHeight: 48 }}>
          <Pressable style={[styles.categoryChip, activeCat === 'all' && styles.categoryChipActive]} onPress={() => setActiveCat('all')}>
            <Text style={activeCat === 'all' ? styles.categoryChipTextActive : styles.categoryChipText}>Todos</Text>
          </Pressable>
          {categories.map((c) => (
            <Pressable key={c.id} style={[styles.categoryChip, activeCat === c.id && styles.categoryChipActive]} onPress={() => setActiveCat(c.id)}>
              <Text style={activeCat === c.id ? styles.categoryChipTextActive : styles.categoryChipText}>{c.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>No hay productos disponibles.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#f97316" />}>
          {filtered.map((p) => (
            <Pressable key={p.id} style={styles.card} onPress={() => router.push(`/(client)/product-detail?id=${p.id}` as any)} disabled={!p.is_available}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{p.name}</Text>
                  <Text style={styles.cardSub}>{p.description ?? 'Sin descripción'}</Text>
                  <Text style={styles.cardPrice}>${Number(p.price).toFixed(2)}</Text>
                  {!p.is_available && <Text style={[styles.badge, styles.badgeRed, { alignSelf: 'flex-start', marginTop: 4 }]}>Agotado</Text>}
                  {p.is_featured && <Text style={[styles.badge, styles.badgeOrange, { alignSelf: 'flex-start', marginTop: 4 }]}>★ Destacado</Text>}
                </View>
                {p.image_url ? (
                  <View style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#262a33' }} />
                ) : (
                  <View style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#262a33', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24 }}>🍽️</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
