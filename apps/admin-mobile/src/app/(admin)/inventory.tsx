import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/api';
import { fetchIngredients } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

export default function InventoryScreen() {
  const styles = useStyles();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', unit: 'unidad', stock: '0', min_stock: '5' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchIngredients(user.restaurant_id);
      setItems(data ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm({ name: '', unit: 'unidad', stock: '0', min_stock: '5' }); setModalOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ name: i.name, unit: i.unit, stock: i.stock.toString(), min_stock: i.min_stock.toString() }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        unit: form.unit.trim(),
        stock: parseFloat(form.stock) || 0,
        min_stock: parseFloat(form.min_stock) || 0,
      };
      if (editing) {
        const { error } = await supabase.from('ingredients').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else if (user?.restaurant_id) {
        const { error } = await supabase.from('ingredients').insert({ restaurant_id: user.restaurant_id, ...payload });
        if (error) throw error;
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este ingrediente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await supabase.from('ingredients').delete().eq('id', id); setItems((prev) => prev.filter((i) => i.id !== id)); }
        catch (err: any) { Alert.alert('Error', err?.message); }
      }}
    ]);
  };

  const lowStock = items.filter((i) => i.stock <= i.min_stock);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Inventario</Text>
            <Text style={styles.headerSubtitle}>{items.length} ingredientes{lowStock.length > 0 ? ` · ${lowStock.length} bajo` : ''}</Text>
          </View>
        </View>
        <Pressable onPress={openNew}><Text style={{ color: '#f97316', fontSize: 28, fontWeight: '600' }}>+</Text></Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>No hay ingredientes.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {items.map((i) => (
            <View key={i.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Pressable style={{ flex: 1 }} onPress={() => openEdit(i)}>
                  <Text style={styles.cardTitle}>{i.name}</Text>
                  <Text style={styles.cardSub}>{i.unit} · Stock: {i.stock} · Mín: {i.min_stock}</Text>
                  <Text style={[styles.badge, i.stock <= i.min_stock ? styles.badgeRed : styles.badgeGreen, { alignSelf: 'flex-start', marginTop: 6 }]}>
                    {i.stock <= i.min_stock ? 'Stock bajo' : 'OK'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(i.id)} style={[styles.btn, styles.btnDanger, { paddingHorizontal: 12 }]}>
                  <Text style={styles.btnTextDanger}>✕</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {modalOpen && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1c1f26', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#f4f4f5', marginBottom: 16 }}>
              {editing ? 'Editar ingrediente' : 'Nuevo ingrediente'}
            </Text>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholderTextColor="#71717a" autoFocus />
            <Text style={styles.label}>Unidad</Text>
            <TextInput style={styles.input} value={form.unit} onChangeText={(v) => setForm({ ...form, unit: v })} placeholderTextColor="#71717a" placeholder="kg, litro, unidad..." />
            <Text style={styles.label}>Stock actual</Text>
            <TextInput style={styles.input} value={form.stock} onChangeText={(v) => setForm({ ...form, stock: v })} placeholderTextColor="#71717a" keyboardType="numeric" />
            <Text style={styles.label}>Stock mínimo</Text>
            <TextInput style={styles.input} value={form.min_stock} onChangeText={(v) => setForm({ ...form, min_stock: v })} placeholderTextColor="#71717a" keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => setModalOpen(false)}>
                <Text style={styles.btnTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.btnText}>{saving ? '...' : 'Guardar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
