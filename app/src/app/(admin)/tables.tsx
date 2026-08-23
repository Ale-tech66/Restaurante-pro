import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import {
  fetchTables,
  createTable,
  updateTable,
  deleteTable,
} from '@/lib/api';
import type { Table } from '@/types';
import { styles } from '@/styles/tables.styles';

const statusColors: Record<string, string> = {
  libre: '#166534',
  ocupada: '#f97316',
  esperando_pago: '#7c2d12',
  reservada: '#1e3a8a',
  fuera_servicio: '#3f3f46',
};

const statusLabels: Record<string, string> = {
  libre: 'Libre',
  ocupada: 'Ocupada',
  esperando_pago: 'Esperando pago',
  reservada: 'Reservada',
  fuera_servicio: 'Fuera de servicio',
};

export default function TablesScreen() {
  const user = useAuthStore((s) => s.user);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchTables(user.restaurant_id);
      setTables(data as Table[]);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudieron cargar las mesas');
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
    setEditingTable(null);
    setNumber('');
    setCapacity('4');
    setModalVisible(true);
  };

  const openEdit = (table: Table) => {
    setEditingTable(table);
    setNumber(table.number);
    setCapacity(table.capacity.toString());
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!user?.restaurant_id) {
      Alert.alert('Error', 'No tienes un restaurante asignado. Cierra sesión y vuelve a entrar.');
      return;
    }
    if (!number.trim()) {
      Alert.alert('Error', 'El número/nombre de la mesa es obligatorio');
      return;
    }
    const cap = parseInt(capacity) || 4;
    setIsSaving(true);
    try {
      if (editingTable) {
        await updateTable(editingTable.id, { number: number.trim(), capacity: cap });
      } else {
        await createTable({
          restaurant_id: user.restaurant_id,
          number: number.trim(),
          capacity: cap,
        });
      }
      setModalVisible(false);
      load();
    } catch (error: any) {
      Alert.alert('Error al guardar', error?.message ?? 'No se pudo guardar la mesa');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (table: Table) => {
    Alert.alert('Eliminar', `¿Eliminar la mesa "${table.number}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTable(table.id);
            setTables((prev) => prev.filter((t) => t.id !== table.id));
          } catch (error: any) {
            Alert.alert('Error', error?.message ?? 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const cycleStatus = async (table: Table) => {
    const statuses: Table['status'][] = [
      'libre',
      'ocupada',
      'esperando_pago',
      'reservada',
      'fuera_servicio',
    ];
    const currentIdx = statuses.indexOf(table.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];
    try {
      await updateTable(table.id, { status: nextStatus });
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? { ...t, status: nextStatus } : t))
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo actualizar');
    }
  };

  const renderItem = ({ item }: { item: Table }) => (
    <Pressable
      style={styles.card}
      onPress={() => openEdit(item)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.cardNumber}>{item.number}</Text>
        <Text style={styles.cardCapacity}>Capacidad: {item.capacity}</Text>
      </View>
      <Pressable
        style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}
        onPress={() => cycleStatus(item)}
      >
        <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Mesas</Text>
        <Pressable style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addText}>+ Nueva</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay mesas registradas.</Text>
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
                {editingTable ? 'Editar mesa' : 'Nueva mesa'}
              </Text>
              <Text style={styles.label}>Número / Nombre</Text>
              <TextInput
                style={styles.modalInput}
                value={number}
                onChangeText={setNumber}
                placeholder="Ej: Mesa 1"
                placeholderTextColor="#52525b"
                autoFocus
              />
              <Text style={styles.label}>Capacidad</Text>
              <TextInput
                style={styles.modalInput}
                value={capacity}
                onChangeText={setCapacity}
                placeholder="4"
                placeholderTextColor="#52525b"
                keyboardType="number-pad"
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
