import { useState, useEffect, useCallback } from 'react';
import { StickyNote } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import './Pages.css';

const statusColors: Record<string, string> = {
  nuevo: '#3b82f6',
  aceptado: '#f97316',
  preparando: '#fbbf24',
  listo: '#4ade80',
};

export function Kitchen() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select(`
          id, order_number, status, table_id, notes, created_at,
          table:tables(number),
          items:order_items(id, quantity, unit_price, notes, product:products(name))
        `)
        .eq('restaurant_id', user.restaurant_id)
        .in('status', ['nuevo', 'aceptado', 'preparando', 'listo'])
        .order('created_at', { ascending: true });
      if (err) throw err;
      setOrders(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar cocina');
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const advanceStatus = async (orderId: string, current: string) => {
    const next: Record<string, string> = {
      nuevo: 'aceptado',
      aceptado: 'preparando',
      preparando: 'listo',
      listo: 'listo',
    };
    const newStatus = next[current] ?? 'listo';
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo actualizar');
    }
  };

  const elapsed = (createdAt: string) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (isLoading) return <div className="loading" />;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Cocina</h1>
          <p className="page-subtitle">{orders.length} pedidos activos — KDS</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>↻ Actualizar</button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">No hay pedidos en cocina.</div>
      ) : (
        <div className="kds-grid">
          {orders.map((o) => (
            <div
              key={o.id}
              className="kds-card"
              style={{ borderLeftColor: statusColors[o.status] ?? 'var(--primary)' }}
            >
              <div className="kds-card-header">
                <div>
                  <div className="kds-order-num">#{o.order_number}</div>
                  <div className="kds-time">Mesa {o.table?.number ?? '—'} · {elapsed(o.created_at)}</div>
                </div>
                <span className={`badge ${o.status === 'listo' ? 'badge-green' : 'badge-orange'}`}>
                  {o.status.toUpperCase()}
                </span>
              </div>

              {o.items?.map((item: any) => (
                <div key={item.id} className="kds-item">
                  <span style={{ fontWeight: 600 }}>{item.quantity}x</span>
                  <span style={{ flex: 1, marginLeft: 8 }}>{item.product?.name ?? 'Producto'}</span>
                </div>
              ))}

              {o.notes && (
                <div style={{ fontSize: 13, color: 'var(--warning)', marginTop: 8, fontStyle: 'italic' }}>
                  <StickyNote size={13} style={{ display:"inline", verticalAlign:"-2px", marginRight:4 }} />{o.notes}
                </div>
              )}

              <div className="kds-actions">
                {o.status !== 'listo' && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => advanceStatus(o.id, o.status)}
                  >
                    {o.status === 'nuevo' && 'Aceptar'}
                    {o.status === 'aceptado' && 'Empezar a preparar'}
                    {o.status === 'preparando' && 'Marcar listo'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
