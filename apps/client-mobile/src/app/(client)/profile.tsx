import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { THEMES, THEME_ORDER } from '@restaurante-pro/shared';
import { useStyles } from '@/styles/shared.styles';

export default function ProfileScreen() {
  const styles = useStyles();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
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
        {/* Selector de tema */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Elije tu tema</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {THEME_ORDER.map((key) => {
              const t = THEMES[key];
              const active = theme === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setTheme(key)}
                  style={{
                    width: '31%', flexGrow: 1,
                    backgroundColor: active ? t.primarySoft : styles.card.backgroundColor,
                    borderWidth: 1.5,
                    borderColor: active ? t.primary : (styles as any).card.borderColor,
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                    {[t.bg, t.primary, t.text].map((c, i) => (
                      <View key={i} style={{ width: 16, height: 16, borderRadius: 5, backgroundColor: c, borderWidth: 1, borderColor: (styles as any).card.borderColor }} />
                    ))}
                  </View>
                  <Text style={[styles.cardTitle, { fontSize: 13 }]}>
                    {active ? '✓ ' : ''}{t.name}
                  </Text>
                  <Text style={[styles.cardSub, { fontSize: 11 }]} numberOfLines={1}>{t.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

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
