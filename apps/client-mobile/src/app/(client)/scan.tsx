import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { fetchMenuByQrToken } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

export default function ScanScreen() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const setQrContext = useCartStore((s) => s.setQrContext);

  const handleManualToken = async () => {
    if (!token.trim()) return;
    setLoading(true);
    try {
      const menu = await fetchMenuByQrToken(token.trim());
      setQrContext(token.trim(), menu.restaurant_name, menu.table_number);
      router.replace('/(client)/menu' as any);
    } catch (err: any) {
      Alert.alert('QR inválido', 'No se pudo validar el código. Verifica e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <Text style={styles.topBarTitle}>Escanear QR</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={[styles.scroll, { justifyContent: 'center' }]}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 64 }}>📷</Text>
          <Text style={[styles.title, { fontSize: 20, marginTop: 12 }]}>Escanea el código QR</Text>
          <Text style={styles.subtitle}>Está en tu mesa</Text>
        </View>

        {/* TODO: integrar expo-camera para escaneo real.
            Por ahora se puede ingresar el token manualmente. */}
        <Text style={styles.label}>O ingresa el código manualmente</Text>
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setToken}
          placeholder="Código QR..."
          placeholderTextColor="#71717a"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleManualToken} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Validando...' : 'Continuar'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
