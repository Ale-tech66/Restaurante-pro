import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { View, ActivityIndicator } from 'react-native';

export default function AdminLayout() {
  const { user, role, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f1115', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (role !== 'admin') return <Redirect href="/" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="products" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="tables" />
    </Stack>
  );
}
