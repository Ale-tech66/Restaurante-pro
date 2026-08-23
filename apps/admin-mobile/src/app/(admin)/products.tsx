import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '@/lib/api';
import { useStyles } from '@/styles/shared.styles';

export default function ProductsScreen() {
  const styles = useStyles();
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', is_available: true, is_featured: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const [prods, cats] = await Promise.all([
        fetchProducts(user.restaurant_id),
        fetchCategories(user.restaurant_id),
      ]);
      setProducts(prods ?? []);
      setCategories(cats ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', category_id: '', is_available: true, is_featured: false });
    setModalOpen(true);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? '', price: p.price.toString(), category_id: p.category_id ?? '', is_available: p.is_available, is_featured: p.is_featured });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum)) return;
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: priceNum,
        category_id: form.category_id || null,
        is_available: form.is_available,
        is_featured: form.is_featured,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else if (user?.restaurant_id) {
        await createProduct({ restaurant_id: user.restaurant_id, ...payload });
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
    Alert.alert('Eliminar', '¿Eliminar este producto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteProduct(id); setProducts((prev) => prev.filter((p) => p.id !== id)); }
        catch (err: any) { Alert.alert('Error', err?.message); }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Productos</Text>
            <Text style={styles.headerSubtitle}>{products.length} productos</Text>
          </View>
        </View>
        <Pressable onPress={openNew}><Text style={{ color: '#f97316', fontSize: 28, fontWeight: '600' }}>+</Text></Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : products.length === 0 ? (
        <Text style={styles.empty}>No hay productos. Crea el primero.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {products.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Pressable style={{ flex: 1 }} onPress={() => openEdit(p)}>
                  <Text style={styles.cardTitle}>{p.name}</Text>
                  <Text style={styles.cardSub}>{p.description ?? 'Sin descripción'}</Text>
                  <Text style={styles.cardPrice}>${p.price.toFixed(2)}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Text style={[styles.badge, p.is_available ? styles.badgeGreen : styles.badgeRed]}>
                      {p.is_available ? 'Disponible' : 'Agotado'}
                    </Text>
                    {p.is_featured && <Text style={[styles.badge, styles.badgeOrange]}>★</Text>}
                  </View>
                </Pressable>
                <Pressable onPress={() => handleDelete(p.id)} style={[styles.btn, styles.btnDanger, { paddingHorizontal: 12, height: 36 }]}>
                  <Text style={styles.btnTextDanger}>✕</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {modalOpen && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1c1f26', borderRadius: 16, padding: 24, maxHeight: '80%' }}>
            <ScrollView>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#f4f4f5', marginBottom: 16 }}>
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </Text>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholderTextColor="#71717a" />
              <Text style={styles.label}>Descripción</Text>
              <TextInput style={styles.input} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholderTextColor="#71717a" multiline />
              <Text style={styles.label}>Precio *</Text>
              <TextInput style={styles.input} value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} placeholderTextColor="#71717a" keyboardType="numeric" />
              <Text style={styles.label}>Categoría</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
                <Pressable onPress={() => setForm({ ...form, category_id: '' })} style={[styles.btn, form.category_id === '' ? styles.btnPrimary : styles.btnSecondary, { paddingHorizontal: 12 }]}>
                  <Text style={form.category_id === '' ? styles.btnText : styles.btnTextSecondary}>Sin categoría</Text>
                </Pressable>
                {categories.map((c) => (
                  <Pressable key={c.id} onPress={() => setForm({ ...form, category_id: c.id })} style={[styles.btn, form.category_id === c.id ? styles.btnPrimary : styles.btnSecondary, { paddingHorizontal: 12 }]}>
                    <Text style={form.category_id === c.id ? styles.btnText : styles.btnTextSecondary}>{c.name}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginVertical: 8 }}>
                <Pressable onPress={() => setForm({ ...form, is_available: !form.is_available })} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: form.is_available ? '#4ade80' : '#71717a', fontSize: 24 }}>{form.is_available ? '☑' : '☐'}</Text>
                  <Text style={{ color: '#d4d4d8', fontSize: 14 }}>Disponible</Text>
                </Pressable>
                <Pressable onPress={() => setForm({ ...form, is_featured: !form.is_featured })} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: form.is_featured ? '#f97316' : '#71717a', fontSize: 24 }}>{form.is_featured ? '☑' : '☐'}</Text>
                  <Text style={{ color: '#d4d4d8', fontSize: 14 }}>Destacado</Text>
                </Pressable>
              </View>
            </ScrollView>
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
