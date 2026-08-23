import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchUsers, fetchRoles, inviteStaffUser, supabase } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

const roleColors: Record<string, any> = {
  admin: styles.badgeOrange, gerente: styles.badgeBlue, cajero: styles.badgeGreen,
  mesero: styles.badgeGray, cocina: styles.badgeRed,
};

export default function UsersScreen() {
  const user = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', fullName: '', roleName: 'mesero' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const [u, r] = await Promise.all([fetchUsers(user.restaurant_id), fetchRoles()]);
      setUsers(u ?? []); setRoles(r ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async () => {
    if (!form.email.trim() || !form.fullName.trim()) return;
    setSaving(true);
    try {
      await inviteStaffUser({
        email: form.email.trim(), fullName: form.fullName.trim(),
        roleName: form.roleName, restaurantId: user!.restaurant_id!,
      });
      setModalOpen(false); setForm({ email: '', fullName: '', roleName: 'mesero' }); load();
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: any) => {
    try {
      const { error } = await supabase.from('users').update({ is_active: !u.is_active }).eq('id', u.id);
      if (error) throw error;
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Usuarios</Text>
            <Text style={styles.headerSubtitle}>{users.length} usuarios</Text>
          </View>
        </View>
        <Pressable onPress={() => setModalOpen(true)}><Text style={{ color: '#f97316', fontSize: 28, fontWeight: '600' }}>+</Text></Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : users.length === 0 ? (
        <Text style={styles.empty}>No hay usuarios.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {users.map((u) => (
            <View key={u.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{u.full_name}</Text>
                  <Text style={styles.cardSub}>{u.email}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                    <Text style={[styles.badge, roleColors[u.role?.name] ?? styles.badgeGray]}>{u.role?.name ?? '—'}</Text>
                    <Text style={[styles.badge, u.is_active ? styles.badgeGreen : styles.badgeRed]}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => toggleActive(u)} style={[styles.btn, styles.btnSecondary, { paddingHorizontal: 12 }]}>
                  <Text style={styles.btnTextSecondary}>{u.is_active ? 'Desactivar' : 'Activar'}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {modalOpen && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1c1f26', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#f4f4f5', marginBottom: 16 }}>Invitar empleado</Text>
            <Text style={styles.label}>Nombre completo *</Text>
            <TextInput style={styles.input} value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} placeholderTextColor="#71717a" autoFocus />
            <Text style={styles.label}>Correo *</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholderTextColor="#71717a" keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Rol</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
              {roles.map((r) => (
                <Pressable key={r.id} onPress={() => setForm({ ...form, roleName: r.name })}
                  style={[styles.btn, form.roleName === r.name ? styles.btnPrimary : styles.btnSecondary, { paddingHorizontal: 12 }]}>
                  <Text style={form.roleName === r.name ? styles.btnText : styles.btnTextSecondary}>{r.name}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => setModalOpen(false)}>
                <Text style={styles.btnTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={handleInvite} disabled={saving}>
                <Text style={styles.btnText}>{saving ? '...' : 'Invitar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
