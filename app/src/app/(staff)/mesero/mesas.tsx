import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder — se implementa en la fase de Cocina + Mesero
export default function MeseroMesasScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f1115' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#f4f4f5' }}>
          Panel del Mesero
        </Text>
        <Text style={{ color: '#a1a1aa', marginTop: 8 }}>Próximamente</Text>
      </View>
    </SafeAreaView>
  );
}
