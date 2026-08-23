import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { View, ActivityIndicator } from 'react-native';

export default function ClientLayout() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f1115', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // El cliente puede acceder sin login (vía QR anónimo).
  // Si hay sesión y no es cliente, redirige a su panel.
  if (user && user.role && (user as any).role?.name !== 'cliente') {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="menu" />
      <Stack.Screen name="product-detail" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
    </Stack>
  );
}
