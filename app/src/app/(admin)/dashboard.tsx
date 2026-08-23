import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth';
import { styles } from '@/styles/dashboard.styles';

const menuItems = [
  { key: 'products', label: 'Productos', route: '/(admin)/products', icon: '🍽️' },
  { key: 'categories', label: 'Categorías', route: '/(admin)/categories', icon: '📁' },
  { key: 'tables', label: 'Mesas', route: '/(admin)/tables', icon: '🪑' },
  { key: 'inventory', label: 'Inventario', route: '/(admin)/inventory', icon: '📦' },
  { key: 'orders', label: 'Pedidos', route: '/(admin)/orders', icon: '📋' },
  { key: 'reports', label: 'Reportes', route: '/(admin)/reports', icon: '📊' },
  { key: 'users', label: 'Usuarios', route: '/(admin)/users', icon: '👥' },
  { key: 'settings', label: 'Configuración', route: '/(admin)/settings', icon: '⚙️' },
] as const;

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.full_name ?? 'Admin'}</Text>
          <Text style={styles.restaurantName}>{user?.email}</Text>
        </View>
        <Pressable onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Pressable
            key={item.key}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
