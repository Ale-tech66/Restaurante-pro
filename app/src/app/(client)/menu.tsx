import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientMenuScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f1115' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#f4f4f5', marginBottom: 8 }}>
          Menú del cliente
        </Text>
        <Text style={{ fontSize: 15, color: '#a1a1aa', textAlign: 'center' }}>
          Esta pantalla se construirá en la siguiente fase:{'\n'}
          QR → Menú → Carrito → Pedido
        </Text>
      </View>
    </SafeAreaView>
  );
}
