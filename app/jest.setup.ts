// Setup global para tests
// Mocks de módulos nativos que no funcionan en Node

// Mock de expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock de expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Mock de expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock de expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
}));

// Mock de react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const ActualReanimated = jest.requireActual('react-native-reanimated/mock');
  ActualReanimated.default.call = () => {};
  return ActualReanimated;
});

// Mock de react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    NativeViewGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    ScrollView: require('react-native').ScrollView,
    Slider: View,
    Switch: require('react-native').Switch,
    TextInput: require('react-native').TextInput,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    FlatList: require('react-native').FlatList,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Silenciar console.error/warn en tests (opcional, comenta para debug)
const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
  originalError.call(console, ...args);
};
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Animated')) return;
  originalWarn.call(console, ...args);
};
