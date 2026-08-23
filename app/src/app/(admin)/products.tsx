import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchProducts, deleteProduct } from '@/lib/api';
import type { Product } from '@/types';
import { styles } from '@/styles/products.styles';

export default function ProductsScreen() {
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchProducts(user.restaurant_id);
      setProducts(data as Product[]);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudieron cargar los productos');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.restaurant_id]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que quieres eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <Pressable
      style={styles.productCard}
      onLongPress={() => handleDelete(item)}
      onPress={() => router.push(`/(admin)/product-edit?id=${item.id}`)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDesc}>
          {item.description ?? 'Sin descripción'}
        </Text>
        <View style={styles.tags}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <View
            style={[
              styles.badge,
              item.is_available ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Text style={styles.badgeText}>
              {item.is_available ? 'Disponible' : 'Agotado'}
            </Text>
          </View>
          {item.is_featured && (
            <View style={styles.badgeFeatured}>
              <Text style={styles.badgeText}>★ Destacado</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Productos</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/(admin)/product-edit')}
        >
          <Text style={styles.addText}>+ Nuevo</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadProducts} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No hay productos todavía.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
