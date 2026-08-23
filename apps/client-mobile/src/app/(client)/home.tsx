import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

export default function HomeScreen() {
  const styles = useStyles();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('restaurants')
        .select('id, name, slug, logo_url, address, is_active')
        .or(`name.ilike.%${searchQuery.trim()}%,slug.ilike.%${searchQuery.trim()}%`)
        .eq('is_active', true)
        .limit(20);
      if (err) throw err;
      setResults(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Error al buscar');
    } finally {
      setSearching(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Restaurante Pro</Text>
          <Text style={styles.topBarSub}>{user ? `Hola, ${user.full_name}` : 'Busca o escanea'}</Text>
        </View>
        {user && (
          <Pressable onPress={async () => { await signOut(); router.replace('/(auth)/login'); }}>
            <Text style={{ color: '#f87171', fontSize: 14, fontWeight: '600' }}>Salir</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Escanear QR */}
        <Pressable
          style={[styles.card, { alignItems: 'center', paddingVertical: 32, borderLeftWidth: 4, borderLeftColor: '#f97316' }]}
          onPress={() => router.push('/(client)/scan' as any)}
        >
          <Text style={{ fontSize: 48 }}>📷</Text>
          <Text style={[styles.cardTitle, { fontSize: 18, marginTop: 8 }]}>Escanear QR</Text>
          <Text style={styles.cardSub}>Escanea el código de tu mesa</Text>
        </Pressable>

        {/* Buscar restaurante */}
        <Text style={[styles.label, { marginTop: 16 }]}>Buscar restaurante</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Nombre o código..."
            placeholderTextColor="#71717a"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Pressable style={[styles.btn, styles.btnPrimary, { paddingHorizontal: 20 }]} onPress={handleSearch} disabled={searching}>
            {searching ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>🔍</Text>}
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {results.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { marginBottom: 8 }]}>Resultados</Text>
            {results.map((r) => (
              <Pressable key={r.id} style={styles.card} onPress={() => router.push(`/(client)/menu?restaurant=${r.id}` as any)}>
                <Text style={styles.cardTitle}>{r.name}</Text>
                <Text style={styles.cardSub}>{r.address ?? 'Sin dirección'}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {!searching && results.length === 0 && !error && (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.empty, { paddingVertical: 20 }]}>
              Escanea el QR de tu mesa o busca un restaurante por nombre.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
