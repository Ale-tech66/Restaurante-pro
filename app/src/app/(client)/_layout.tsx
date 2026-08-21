import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { View, ActivityIndicator, Text } from 'react-native';

export default function ClientLayout() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f1115', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // El cliente no necesita login necesariamente (accede por QR),
  // pero si hay sesión y no es cliente, redirige.
  if (user && user.role && (user as any).role?.name !== 'cliente') {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="menu" />
    </Stack>
  );
}
