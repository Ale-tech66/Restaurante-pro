import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCartStore } from '@/stores/cart';
import { fetchMenuByQrToken } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

export default function ScanScreen() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const setQrContext = useCartStore((s) => s.setQrContext);

  const validateToken = useCallback(
    async (code: string) => {
      if (loading) return;
      setLoading(true);
      try {
        const menu = await fetchMenuByQrToken(code.trim());
        setQrContext(code.trim(), menu.restaurant_name, menu.table_number);
        router.replace('/(client)/menu' as any);
      } catch (err: any) {
        Alert.alert('QR inválido', 'No se pudo validar el código. Verifica e intenta de nuevo.');
        setScanned(false);
      } finally {
        setLoading(false);
      }
    },
    [loading, setQrContext]
  );

  const handleBarcodeScan = ({ data }: { data: string }) => {
    if (scanned || loading || !data.trim()) return;
    setScanned(true);
    validateToken(data);
  };

  const showCamera = permission?.granted;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <Text style={styles.topBarTitle}>Escanear QR</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={[styles.scroll, { justifyContent: 'center' }]}>
        {!showCamera ? (
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 64 }}>📷</Text>
            <Text style={[styles.title, { fontSize: 20, marginTop: 12 }]}>Escanea el código QR</Text>
            <Text style={styles.subtitle}>Está en tu mesa</Text>
            {permission && !permission.granted && (
              <>
                <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 8 }]}>
                  Necesitamos acceso a tu cámara para escanear el QR.
                </Text>
                <Pressable style={[styles.button, { marginTop: 12 }]} onPress={requestPermission}>
                  <Text style={styles.buttonText}>Dar permiso</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : (
          <View style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
            <CameraView
              style={{ width: '100%', aspectRatio: 1 }}
              facing="back"
              active={true}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcodeScan}
            >
              {loading && (
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#f97316" />
                  <Text style={{ color: '#f4f4f5', marginTop: 12 }}>Validando...</Text>
                </View>
              )}
            </CameraView>
          </View>
        )}

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
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => validateToken(token)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Validando...' : 'Continuar'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
