import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { THEMES, THEME_ORDER } from '@restaurante-pro/shared';
import { supabase } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

export default function SettingsScreen() {
  const styles = useStyles();
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', currency: 'USD', tax_rate: '0' });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.restaurant_id) return;
    const load = async () => {
      try {
        const { data } = await supabase.from('restaurants').select('*').eq('id', user.restaurant_id).single();
        if (data) {
          setForm({
            name: data.name ?? '', address: data.address ?? '', phone: data.phone ?? '',
            email: data.email ?? '', currency: data.currency ?? 'USD', tax_rate: (data.tax_rate ?? 0).toString(),
          });
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.restaurant_id]);

  const handleSave = async () => {
    if (!user?.restaurant_id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('restaurants').update({
        name: form.name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        currency: form.currency.trim(),
        tax_rate: parseFloat(form.tax_rate) || 0,
        updated_at: new Date().toISOString(),
      }).eq('id', user.restaurant_id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Configuración</Text>
            <Text style={styles.headerSubtitle}>Datos del restaurante</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { gap: 8 }]}>
        {/* Selector de tema */}
        <Text style={styles.label}>Elije tu tema</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
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
                    <View key={i} style={{ width: 16, height: 16, borderRadius: 5, backgroundColor: c, borderWidth: 1, borderColor: styles.card.borderColor }} />
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

        {saved && (
          <View style={{ backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)', borderRadius: 8, padding: 14, marginBottom: 8 }}>
            <Text style={{ color: '#4ade80', fontSize: 14 }}>✓ Configuración guardada</Text>
          </View>
        )}
        <Text style={styles.label}>Nombre del restaurante *</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholderTextColor="#71717a" />
        <Text style={styles.label}>Dirección</Text>
        <TextInput style={styles.input} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} placeholderTextColor="#71717a" />
        <Text style={styles.label}>Teléfono</Text>
        <TextInput style={styles.input} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholderTextColor="#71717a" keyboardType="phone-pad" />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholderTextColor="#71717a" keyboardType="email-address" autoCapitalize="none" />
        <Text style={styles.label}>Moneda</Text>
        <TextInput style={styles.input} value={form.currency} onChangeText={(v) => setForm({ ...form, currency: v })} placeholderTextColor="#71717a" placeholder="USD, MXN, EUR..." />
        <Text style={styles.label}>Tasa de impuesto (%)</Text>
        <TextInput style={styles.input} value={form.tax_rate} onChangeText={(v) => setForm({ ...form, tax_rate: v })} placeholderTextColor="#71717a" keyboardType="numeric" />

        <Pressable style={[styles.btn, styles.btnPrimary, { marginTop: 24 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
