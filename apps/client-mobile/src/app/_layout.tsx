import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/stores/auth';
import { usePalette } from '@/stores/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initialize = useAuthStore((s) => s.initialize);
  const palette = usePalette();

  useEffect(() => {
    initialize();
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(timer);
  }, [initialize]);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={palette.isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: palette.bg },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(client)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
