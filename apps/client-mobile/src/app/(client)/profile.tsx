import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { styles } from '@/styles/shared.styles';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = () => {
    Alert.alert('Salir', '¿Cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => {
        await signOut();
        router.replace('/(auth)/login');
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
        <Text style={styles.topBarTitle}>Perfil</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {user ? (
          <>
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
                  {(user.full_name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#f4f4f5' }}>{user.full_name}</Text>
              <Text style={styles.cardSub}>{user.email}</Text>
            </View>

            <Pressable style={styles.card} onPress={() => router.push('/(client)/orders' as any)}>
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>Mis pedidos</Text>
                <Text style={{ color: '#f97316', fontSize: 18 }}>→</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#f87171' }]} onPress={handleSignOut}>
              <Text style={{ color: '#f87171', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Cerrar sesión</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
              <Text style={{ fontSize: 40 }}>👤</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#f4f4f5', marginTop: 8 }}>No has iniciado sesión</Text>
              <Text style={styles.cardSub}>Inicia sesión para ver tus pedidos y guardar favoritos</Text>
            </View>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.btnText}>Iniciar sesión</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
