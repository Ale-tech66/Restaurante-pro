// Mock de módulos nativos de Expo y React Native

// Env vars dummy para que createClient no falle al importar módulos
// (los tests siempre mockean las funciones, nunca llaman a la API real)
process.env.EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';


jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: 'View',
  ScrollView: 'ScrollView',
  State: {},
  PanGestureHandler: 'View',
  TapGestureHandler: 'View',
}));
