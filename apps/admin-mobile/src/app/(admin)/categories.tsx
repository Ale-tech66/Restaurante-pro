import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { styles } from '@/styles/shared.styles';

export default function CategoriesScreen() {
  const user = useAuthStore((s) => s.user);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchCategories(user.restaurant_id);
      setCategories(data ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setName(''); setModalOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setName(c.name); setModalOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, { name: name.trim() });
      } else if (user?.restaurant_id) {
        await createCategory({ restaurant_id: user.restaurant_id, name: name.trim() });
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar esta categoría?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await deleteCategory(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err?.message);
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: '#f97316', fontSize: 16 }}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Categorías</Text>
            <Text style={styles.headerSubtitle}>{categories.length} categorías</Text>
          </View>
        </View>
        <Pressable onPress={openNew}><Text style={{ color: '#f97316', fontSize: 28, fontWeight: '600' }}>+</Text></Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#f97316" /></View>
      ) : categories.length === 0 ? (
        <Text style={styles.empty}>No hay categorías. Crea la primera.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {categories.map((c) => (
            <Pressable key={c.id} style={styles.card} onPress={() => openEdit(c)}>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.cardTitle}>{c.name}</Text>
                  <Text style={styles.cardSub}>{c.is_active ? 'Activa' : 'Inactiva'}</Text>
                </View>
                <Pressable onPress={() => handleDelete(c.id)} style={[styles.btn, styles.btnDanger, { paddingHorizontal: 12 }]}>
                  <Text style={styles.btnTextDanger}>Eliminar</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {modalOpen && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1c1f26', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#f4f4f5', marginBottom: 16 }}>
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre de la categoría"
              placeholderTextColor="#71717a"
              autoFocus
            />
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
