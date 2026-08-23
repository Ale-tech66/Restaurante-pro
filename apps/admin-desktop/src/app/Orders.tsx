import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { fetchActiveOrders, updateOrderStatus } from '@/lib/api';
import './Pages.css';

const statusLabels: Record<string, string> = {
  nuevo: 'Nuevo',
  aceptado: 'Aceptado',
  preparando: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
};

const statusColors: Record<string, string> = {
  nuevo: 'badge-blue',
  aceptado: 'badge-orange',
  preparando: 'badge-orange',
  listo: 'badge-green',
  entregado: 'badge-green',
  pagado: 'badge-gray',
  cancelado: 'badge-red',
};

export function Orders() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('activos');

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchActiveOrders(user.restaurant_id);
      setOrders(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar pedidos');
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo actualizar');
    }
  };

  const filtered = filter === 'todos'
    ? orders
    : orders.filter((o) =>
        filter === 'activos'
          ? ['nuevo', 'aceptado', 'preparando', 'listo'].includes(o.status)
          : o.status === filter
      );

  if (isLoading) return <div className="loading" />;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">{filtered.length} pedidos</p>
        </div>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="activos">Activos</option>
          <option value="nuevo">Nuevos</option>
          <option value="preparando">Preparando</option>
          <option value="listo">Listos</option>
          <option value="entregado">Entregados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No hay pedidos en este estado.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Mesa</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700 }}>#{o.order_number}</td>
                <td>{o.table?.number ?? '—'}</td>
                <td>{o.customer?.full_name ?? 'Cliente'}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  ${Number(o.total).toFixed(2)}
                </td>
                <td>
                  <span className={`badge ${statusColors[o.status] ?? 'badge-gray'}`}>
                    {statusLabels[o.status] ?? o.status}
                  </span>
                </td>
                <td>{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="aceptado">Aceptar</option>
                    <option value="preparando">Preparando</option>
                    <option value="listo">Listo</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelar</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
