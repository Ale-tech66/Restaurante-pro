import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  fetchCategories,
} from '@/lib/api';
import type { Category, Product } from '@/types';
import { styles } from './product-edit.styles';

export default function ProductEditScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const user = useAuthStore((s) => s.user);
  const isEditing = Boolean(params.id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const cats = await fetchCategories(user.restaurant_id);
      setCategories(cats as Category[]);

      if (isEditing && params.id) {
        const products = await fetchProducts(user.restaurant_id);
        const product = (products as Product[]).find((p) => p.id === params.id);
        if (product) {
          setName(product.name);
          setDescription(product.description ?? '');
          setPrice(product.price.toString());
          setCategoryId(product.category_id);
          setIsAvailable(product.is_available);
          setIsFeatured(product.is_featured);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudieron cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id, isEditing, params.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSave = async () => {
    if (!user?.restaurant_id) return;
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Error', 'El precio no es válido');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && params.id) {
        await updateProduct(params.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          category_id: categoryId,
          is_available: isAvailable,
          is_featured: isFeatured,
        });
      } else {
        await createProduct({
          restaurant_id: user.restaurant_id,
          category_id: categoryId,
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          is_available: isAvailable,
          is_featured: isFeatured,
        });
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo guardar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Cancelar</Text>
          </Pressable>
          <Text style={styles.title}>
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Hamburguesa doble"
            placeholderTextColor="#52525b"
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ingredientes, detalles..."
            placeholderTextColor="#52525b"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Precio *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor="#52525b"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.categoryRow}>
            <Pressable
              style={[
                styles.categoryChip,
                categoryId === null && styles.categoryChipActive,
              ]}
              onPress={() => setCategoryId(null)}
            >
              <Text style={styles.categoryChipText}>Sin categoría</Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  categoryId === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={styles.categoryChipText}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Disponible</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#2a2e37', true: '#166534' }}
              thumbColor={isAvailable ? '#4ade80' : '#71717a'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Destacado</Text>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: '#2a2e37', true: '#78350f' }}
              thumbColor={isFeatured ? '#fbbf24' : '#71717a'}
            />
          </View>

          <Pressable
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Guardar cambios' : 'Crear producto'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
