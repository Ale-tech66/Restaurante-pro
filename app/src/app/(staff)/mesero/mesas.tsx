import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth';
import { fetchTables } from '@/lib/api';
import { subscribeToOrders, fetchOrdersByTable, updateOrderStatus, type OrderWithItems } from '@/lib/staffApi';
import { staffStyles as s } from '@/styles/staff.styles';
import type { Table } from '@/types';

const TABLE_STATUS_INFO: Record<string, { label: string; color: string }> = {
  libre: { label: 'Libre', color: '#22c55e' },
  ocupada: { label: 'Ocupada', color: '#f59e0b' },
  esperando_pago: { label: 'Esperando pago', color: '#60a5fa' },
  reservada: { label: 'Reservada', color: '#a78bfa' },
  fuera_servicio: { label: 'Fuera de servicio', color: '#71717a' },
};

const ORDER_STATUS_INFO: Record<string, { label: string; color: string }> = {
  nuevo: { label: 'Nuevo', color: '#60a5fa' },
  aceptado: { label: 'Aceptado', color: '#3b82f6' },
  preparando: { label: 'Preparando', color: '#f59e0b' },
  listo: { label: 'Listo', color: '#22c55e' },
  entregado: { label: 'Entregado', color: '#16a34a' },
  pagado: { label: 'Pagado', color: '#15803d' },
  cancelado: { label: 'Cancelado', color: '#ef4444' },
};

const formatPrice = (n: number) => `$${n.toFixed(2)}`;

export default function MeseroMesasScreen() {
  const user = useAuthStore((st) => st.user);
  const restaurantId = user?.restaurant_id ?? '';

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableOrders, setTableOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await fetchTables(restaurantId);
      setTables(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadTables();
    const unsub = subscribeToOrders(restaurantId, () => {
      loadTables();
      if (selectedTable) {
        loadTableOrders(selectedTable.id);
      }
    });
    return unsub;
  }, [restaurantId, loadTables, selectedTable]);

  const loadTableOrders = async (tableId: string) => {
    setLoadingOrders(true);
    try {
      const orders = await fetchOrdersByTable(restaurantId, tableId);
      setTableOrders(orders);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    loadTableOrders(table.id);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      if (selectedTable) {
        await loadTableOrders(selectedTable.id);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo actualizar');
    } finally {
      setUpdatingId(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTables();
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={[s.emptyText, { marginTop: 16 }]}>Cargando mesas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Vista detallada de una mesa
  if (selectedTable) {
    const statusInfo = TABLE_STATUS_INFO[selectedTable.status] ?? TABLE_STATUS_INFO.libre;
    const activeOrders = tableOrders.filter(
      (o) => !['cancelado', 'pagado'].includes(o.status)
    );

    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => setSelectedTable(null)}>
            <Text style={{ color: '#a1a1aa', fontSize: 15 }}>← Mesas</Text>
          </Pressable>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.headerTitle}>Mesa {selectedTable.number}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusInfo.color }} />
              <Text style={{ color: statusInfo.color, fontSize: 13, fontWeight: '600' }}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Pedidos de la mesa */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
          }
        >
          {loadingOrders ? (
            <View style={s.centerContainer}>
              <ActivityIndicator size="large" color="#f97316" />
            </View>
          ) : activeOrders.length === 0 ? (
            <View style={s.centerContainer}>
              <Text style={s.emptyIcon}>🍽️</Text>
              <Text style={s.emptyTitle}>Sin pedidos activos</Text>
              <Text style={s.emptyText}>Esta mesa no tiene pedidos en curso</Text>
            </View>
          ) : (
            activeOrders.map((order) => {
              const orderStatus = ORDER_STATUS_INFO[order.status] ?? ORDER_STATUS_INFO.nuevo;
              const isUpdating = updatingId === order.id;

              return (
                <View key={order.id} style={s.orderCard}>
                  {/* Header */}
                  <View style={s.orderCardHeader}>
                    <Text style={s.orderNumber}>Pedido #{order.order_number}</Text>
                    <View style={[s.statusBadge, { backgroundColor: '#0f1115' }]}>
                      <View style={[s.statusDot, { backgroundColor: orderStatus.color }]} />
                      <Text style={[s.statusText, { color: orderStatus.color }]}>{orderStatus.label}</Text>
                    </View>
                  </View>

                  {/* Items */}
                  <View style={s.itemsList}>
                    {order.items.map((item) => (
                      <View key={item.id} style={s.itemRow}>
                        <View style={s.itemLeft}>
                          <View style={s.itemQtyName}>
                            <Text style={s.itemQty}>{item.quantity}×</Text>
                            <Text style={s.itemName}>{item.product_name}</Text>
                          </View>
                          {item.options.length > 0 && (
                            <Text style={s.itemOptions}>
                              {item.options.map((o) => o.value_name ?? o.option_name).join(', ')}
                            </Text>
                          )}
                          {item.notes && <Text style={s.itemNotes}>Nota: {item.notes}</Text>}
                        </View>
                        <Text style={s.itemPrice}>{formatPrice(item.unit_price * item.quantity)}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2a2e37' }}>
                    <Text style={{ color: '#a1a1aa', fontSize: 14 }}>Total</Text>
                    <Text style={{ color: '#f97316', fontSize: 16, fontWeight: '800' }}>
                      {formatPrice(order.total)}
                    </Text>
                  </View>

                  {/* Botones según estado */}
                  {isUpdating ? (
                    <View style={[s.actionRow, { justifyContent: 'center' }]}>
                      <ActivityIndicator color="#f97316" />
                    </View>
                  ) : (
                    <View style={s.actionRow}>
                      {order.status === 'listo' && (
                        <Pressable
                          style={[s.actionBtn, s.actionBtnPrimary]}
                          onPress={() => handleStatusChange(order.id, 'entregado')}
                        >
                          <Text style={s.actionBtnText}>Marcar entregado</Text>
                        </Pressable>
                      )}
                      {order.status === 'entregado' && (
                        <Pressable
                          style={[s.actionBtn, s.actionBtnPrimary]}
                          onPress={() => handleStatusChange(order.id, 'pagado')}
                        >
                          <Text style={s.actionBtnText}>Cobrar</Text>
                        </Pressable>
                      )}
                      {!['entregado', 'pagado', 'cancelado'].includes(order.status) && (
                        <Pressable
                          style={[s.actionBtn, s.actionBtnDanger]}
                          onPress={() => {
                            Alert.alert('Cancelar pedido', '¿Seguro que quieres cancelar este pedido?', [
                              { text: 'No', style: 'cancel' },
                              { text: 'Sí, cancelar', style: 'destructive', onPress: () => handleStatusChange(order.id, 'cancelado') },
                            ]);
                          }}
                        >
                          <Text style={s.actionBtnText}>Cancelar</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Vista de lista de mesas
  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Mesas</Text>
          <Text style={s.headerCount}>
            {tables.length} {tables.length === 1 ? 'mesa' : 'mesas'}
          </Text>
        </View>
        <Pressable style={s.refreshBtn} onPress={onRefresh}>
          <Text style={s.refreshBtnText}>↻ Actualizar</Text>
        </Pressable>
      </View>

      {/* Lista de mesas */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.tablesGrid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
        }
      >
        {tables.length === 0 ? (
          <View style={s.centerContainer}>
            <Text style={s.emptyIcon}>🪑</Text>
            <Text style={s.emptyTitle}>Sin mesas</Text>
            <Text style={s.emptyText}>Crea mesas desde el panel de administrador</Text>
          </View>
        ) : (
          tables.map((table) => {
            const statusInfo = TABLE_STATUS_INFO[table.status] ?? TABLE_STATUS_INFO.libre;
            return (
              <Pressable
                key={table.id}
                style={s.tableCard}
                onPress={() => handleSelectTable(table)}
              >
                <View style={s.tableCardHeader}>
                  <Text style={s.tableCardNumber}>Mesa {table.number}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusInfo.color }} />
                    <Text style={{ color: statusInfo.color, fontSize: 13, fontWeight: '600' }}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>
                <Text style={s.tableCardInfo}>
                  Capacidad: {table.capacity} personas
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
