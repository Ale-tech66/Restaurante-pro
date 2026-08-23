import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api';
import type { Category } from '@/types';
import { styles } from '@/styles/categories.styles';

export default function CategoriesScreen() {
  const user = useAuthStore((s) => s.user);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchCategories(user.restaurant_id);
      setCategories(data as Category[]);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudieron cargar las categorías');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.restaurant_id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openNew = () => {
    setEditingCat(null);
    setName('');
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!user?.restaurant_id) {
      Alert.alert('Error', 'No tienes un restaurante asignado. Cierra sesión y vuelve a entrar.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    setIsSaving(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, { name: name.trim() });
      } else {
        await createCategory({
          restaurant_id: user.restaurant_id,
          name: name.trim(),
        });
      }
      setModalVisible(false);
      load();
    } catch (error: any) {
      Alert.alert('Error al guardar', error?.message ?? 'No se pudo guardar la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('Eliminar', `¿Eliminar la categoría "${cat.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(cat.id);
            setCategories((prev) => prev.filter((c) => c.id !== cat.id));
          } catch (error: any) {
            Alert.alert('Error', error?.message ?? 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Category }) => (
    <Pressable
      style={styles.card}
      onPress={() => openEdit(item)}
      onLongPress={() => handleDelete(item)}
    >
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardStatus}>
        {item.is_active ? 'Activa' : 'Inactiva'}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Categorías</Text>
        <Pressable style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addText}>+ Nueva</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay categorías todavía.</Text>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => !isSaving && setModalVisible(false)}
          >
            <Pressable
              style={styles.modalCard}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>
                {editingCat ? 'Editar categoría' : 'Nueva categoría'}
              </Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="Nombre de la categoría"
                placeholderTextColor="#52525b"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setModalVisible(false)}
                  disabled={isSaving}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalSaveBtn, isSaving && { opacity: 0.5 }]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>Guardar</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
