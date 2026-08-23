import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { fetchMenuByQrToken, type MenuData } from '@/lib/clientApi';
import { clientStyles as s } from '@/styles/client.styles';

export default function ClientMenuScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token ?? '';
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const setTableInfo = useCartStore((s2) => s2.setTableInfo);
  const setMenuData = useCartStore((s2) => s2.setMenuData);
  const itemCount = useCartStore((s2) => s2.getItemCount());
  const cartTotal = useCartStore((s2) => s2.getSubtotal());

  const loadMenu = useCallback(async (t: string) => {
    try {
      setError(null);
      const data = await fetchMenuByQrToken(t);
      setMenu(data);
      setMenuData({
        products: data.products,
        product_options: data.product_options,
        product_option_values: data.product_option_values,
      });
      setTableInfo({
        qr_token: t,
        restaurant_id: data.restaurant_id,
        restaurant_name: data.restaurant_name,
        restaurant_logo: data.restaurant_logo,
        currency: data.currency,
        tax_rate: data.tax_rate,
        table_id: data.table_id,
        table_number: data.table_number,
      });
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo cargar el menú');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setTableInfo, setMenuData]);

  useEffect(() => {
    if (token) {
      loadMenu(token);
    } else {
      setError('No se recibió el código QR. Escanea el QR de tu mesa.');
      setLoading(false);
    }
  }, [token]);

  const onRefresh = () => {
    if (!token) return;
    setRefreshing(true);
    loadMenu(token);
  };

  const filteredProducts = menu
    ? activeCategory === 'all'
      ? menu.products
      : menu.products.filter((p) => p.category_id === activeCategory)
    : [];

  const formatPrice = (n: number) => `$${n.toFixed(2)}`;

  // Estado de carga
  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={[s.emptyText, { marginTop: 16 }]}>Cargando menú...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Estado de error
  if (error || !menu) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <Text style={s.errorIcon}>!</Text>
          <Text style={s.emptyTitle}>No se pudo cargar</Text>
          <Text style={s.emptyText}>{error ?? 'Error desconocido'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
        }
      >
        {/* Header del restaurante */}
        <View style={s.restaurantHeader}>
          <Text style={s.restaurantName}>{menu.restaurant_name}</Text>
          <View style={s.tableBadge}>
            <Text style={s.tableBadgeText}>{menu.table_number}</Text>
          </View>
        </View>

        {/* Tabs de categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryTabs}
        >
          <Pressable
            style={[s.categoryTab, activeCategory === 'all' && s.categoryTabActive]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={[s.categoryTabText, activeCategory === 'all' && s.categoryTabTextActive]}>
              Todo
            </Text>
          </Pressable>
          {menu.categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[s.categoryTab, activeCategory === cat.id && s.categoryTabActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[s.categoryTabText, activeCategory === cat.id && s.categoryTabTextActive]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Lista de productos */}
        <View style={s.productGrid}>
          {filteredProducts.length === 0 ? (
            <Text style={[s.emptyText, { marginTop: 40 }]}>No hay productos en esta categoría</Text>
          ) : (
            filteredProducts.map((product) => (
              <Pressable
                key={product.id}
                style={s.productCard}
                onPress={() =>
                  router.push({
                    pathname: '/(client)/product-detail',
                    params: { product_id: product.id, token },
                  })
                }
              >
                <View style={s.productInfo}>
                  {product.is_featured && (
                    <View style={s.featuredBadge}>
                      <Text style={s.featuredText}>Destacado</Text>
                    </View>
                  )}
                  <Text style={s.productName}>{product.name}</Text>
                  {product.description ? (
                    <Text style={s.productDesc} numberOfLines={2}>{product.description}</Text>
                  ) : null}
                  <Text style={s.productPrice}>{formatPrice(product.price)}</Text>
                </View>
                <View style={s.addBtn}>
                  <Text style={s.addBtnText}>+</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Barra flotante del carrito */}
      {itemCount > 0 && (
        <Pressable style={s.cartBar} onPress={() => router.push('/(client)/cart' as any)}>
          <View>
            <Text style={s.cartBarText}>{itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}</Text>
            <Text style={s.cartBarSubtext}>{formatPrice(cartTotal)}</Text>
          </View>
          <Text style={s.cartBarText}>Ver carrito &gt;</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
