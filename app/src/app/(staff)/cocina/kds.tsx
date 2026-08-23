import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth';
import { fetchActiveOrders, updateOrderStatus, subscribeToOrders, type OrderWithItems } from '@/lib/staffApi';
import { staffStyles as s } from '@/styles/staff.styles';

const STATUS_INFO: Record<string, { label: string; color: string; bgColor: string }> = {
  nuevo: { label: 'Nuevo', color: '#60a5fa', bgColor: '#1e3a5f' },
  aceptado: { label: 'Aceptado', color: '#3b82f6', bgColor: '#1e3a5f' },
  preparando: { label: 'Preparando', color: '#f59e0b', bgColor: '#3f2a0a' },
  listo: { label: 'Listo', color: '#22c55e', bgColor: '#14351f' },
};

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `Hace ${hours}h ${mins % 60}m`;
}

export default function CocinaKdsScreen() {
  const user = useAuthStore((st) => st.user);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const restaurantId = user?.restaurant_id ?? '';

  const loadOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setError(null);
      const data = await fetchActiveOrders(restaurantId);
      setOrders(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadOrders();
    // Suscripción realtime
    const unsub = subscribeToOrders(restaurantId, () => {
      loadOrders();
    });
    return unsub;
  }, [restaurantId, loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Recargar para reflejar el cambio
      await loadOrders();
    } catch (err: any) {
      setError(err?.message ?? 'Error al actualizar');
    } finally {
      setUpdatingId(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={[s.emptyText, { marginTop: 16 }]}>Cargando pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && orders.length === 0) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.centerContainer}>
          <Text style={{ fontSize: 48, color: '#ef4444', fontWeight: '800' }}>!</Text>
          <Text style={s.emptyTitle}>Error</Text>
          <Text style={s.emptyText}>{error}</Text>
          <Pressable style={[s.refreshBtn, { marginTop: 16 }]} onPress={onRefresh}>
            <Text style={s.refreshBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Cocina</Text>
          <Text style={s.headerCount}>
            {orders.length} {orders.length === 1 ? 'pedido activo' : 'pedidos activos'}
          </Text>
        </View>
        <Pressable style={s.refreshBtn} onPress={onRefresh}>
          <Text style={s.refreshBtnText}>↻ Actualizar</Text>
        </Pressable>
      </View>

      {/* Lista de pedidos */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
        }
      >
        {orders.length === 0 ? (
          <View style={s.centerContainer}>
            <Text style={s.emptyIcon}>🍳</Text>
            <Text style={s.emptyTitle}>Sin pedidos activos</Text>
            <Text style={s.emptyText}>Los nuevos pedidos aparecerán aquí automáticamente</Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusInfo = STATUS_INFO[order.status] ?? STATUS_INFO.nuevo;
            const isUpdating = updatingId === order.id;

            return (
              <View key={order.id} style={s.orderCard}>
                {/* Header de la tarjeta */}
                <View style={s.orderCardHeader}>
                  <Text style={s.orderNumber}>#{order.order_number}</Text>
                  <Text style={s.orderTime}>{formatTimeAgo(order.created_at)}</Text>
                </View>

                {/* Mesa y estado */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  {order.table_number && (
                    <View style={s.tableBadge}>
                      <Text style={s.tableBadgeText}>Mesa {order.table_number}</Text>
                    </View>
                  )}
                  <View style={[s.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                    <View style={[s.statusDot, { backgroundColor: statusInfo.color }]} />
                    <Text style={[s.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                </View>

                {/* Items */}
                <View style={s.itemsList}>
                  {order.items.map((item) => (
                    <View key={item.id}>
                      <View style={s.itemRow}>
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
                      </View>
                    </View>
                  ))}
                </View>

                {/* Notas generales */}
                {order.notes && (
                  <View style={s.orderNotes}>
                    <Text style={s.orderNotesLabel}>Notas del pedido</Text>
                    <Text style={s.orderNotesText}>{order.notes}</Text>
                  </View>
                )}

                {/* Botones de acción según estado */}
                {isUpdating ? (
                  <View style={[s.actionRow, { justifyContent: 'center' }]}>
                    <ActivityIndicator color="#f97316" />
                  </View>
                ) : (
                  <View style={s.actionRow}>
                    {order.status === 'nuevo' && (
                      <Pressable
                        style={[s.actionBtn, s.actionBtnPrimary]}
                        onPress={() => handleStatusChange(order.id, 'aceptado')}
                      >
                        <Text style={s.actionBtnText}>Aceptar</Text>
                      </Pressable>
                    )}
                    {order.status === 'aceptado' && (
                      <Pressable
                        style={[s.actionBtn, s.actionBtnPrimary]}
                        onPress={() => handleStatusChange(order.id, 'preparando')}
                      >
                        <Text style={s.actionBtnText}>Empezar a preparar</Text>
                      </Pressable>
                    )}
                    {order.status === 'preparando' && (
                      <Pressable
                        style={[s.actionBtn, s.actionBtnPrimary]}
                        onPress={() => handleStatusChange(order.id, 'listo')}
                      >
                        <Text style={s.actionBtnText}>Marcar listo</Text>
                      </Pressable>
                    )}
                    {order.status === 'listo' && (
                      <View style={[s.actionBtn, { backgroundColor: '#14351f' }]}>
                        <Text style={[s.actionBtnText, { color: '#22c55e' }]}>
                          ✓ Listo para servir
                        </Text>
                      </View>
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
