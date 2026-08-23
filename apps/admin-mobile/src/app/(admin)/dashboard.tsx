import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchDashboardStats } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

export default function DashboardScreen() {
  const styles = useStyles();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchDashboardStats(user.restaurant_id);
      setStats(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => { load(); }, [load]);

  const menuItems = [
    { label: 'Productos', icon: '🍽️', route: '/(admin)/products' },
    { label: 'Categorías', icon: '📁', route: '/(admin)/categories' },
    { label: 'Mesas', icon: '🪑', route: '/(admin)/tables' },
    { label: 'Pedidos', icon: '📋', route: '/(admin)/orders' },
    { label: 'Cocina', icon: '🍳', route: '/(admin)/kitchen' },
    { label: 'Caja', icon: '💵', route: '/(admin)/cashier' },
    { label: 'Inventario', icon: '📦', route: '/(admin)/inventory' },
    { label: 'Usuarios', icon: '👥', route: '/(admin)/users' },
    { label: 'Reportes', icon: '📈', route: '/(admin)/reports' },
    { label: 'Configuración', icon: '⚙️', route: '/(admin)/settings' },
  ];

  const cards = stats ? [
    { label: 'Ventas hoy', value: `$${stats.salesToday.toFixed(2)}`, icon: '💰', color: '#166534' },
    { label: 'Pedidos hoy', value: stats.ordersTodayCount, icon: '📋', color: '#1e3a8a' },
    { label: 'Pendientes', value: stats.pendingOrders, icon: '⏳', color: '#7c2d12' },
    { label: 'Productos', value: stats.productsCount, icon: '🍽️', color: '#78350f' },
    { label: 'Mesas', value: stats.tablesCount, icon: '🪑', color: '#1c1f26' },
  ] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Hola, {user?.full_name}</Text>
        </View>
        <Pressable onPress={async () => { await signOut(); router.replace('/(auth)/login'); }}>
          <Text style={{ color: '#f87171', fontSize: 14, fontWeight: '600' }}>Salir</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#f97316" />}
      >
        {isLoading ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              {cards.map((c) => (
                <View key={c.label} style={[styles.card, { width: '47%', flexGrow: 1, borderLeftWidth: 4, borderLeftColor: c.color }]}>
                  <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#f4f4f5', marginTop: 4 }}>{c.value}</Text>
                  <Text style={{ fontSize: 12, color: '#a1a1aa' }}>{c.label}</Text>
                </View>
              ))}
            </View>

            {/* Menu grid */}
            <View style={styles.grid}>
              {menuItems.map((item) => (
                <Pressable
                  key={item.label}
                  style={[styles.card, { width: '30%', flexGrow: 1, alignItems: 'center', paddingVertical: 20 }]}
                  onPress={() => router.push(item.route as any)}
                >
                  <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 12, color: '#d4d4d8', fontWeight: '600', marginTop: 8, textAlign: 'center' }}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
