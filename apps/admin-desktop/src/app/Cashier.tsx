import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { fetchPendingPayments, registerPayment } from '@/lib/api';
import './Pages.css';

export function Cashier() {
  const user = useAuthStore((s) => s.user);
  const [pending, setPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState<string | null>(null);
  const [method, setMethod] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchPendingPayments(user.restaurant_id);
      setPending(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar caja');
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handlePay = async (orderId: string, total: number) => {
    if (!user?.restaurant_id) return;
    const m = method[orderId] ?? 'efectivo';
    setPaying(orderId);
    try {
      await registerPayment({
        order_id: orderId,
        restaurant_id: user.restaurant_id,
        method: m,
        amount: total,
      });
      setPending((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo registrar el pago');
    } finally {
      setPaying(null);
    }
  };

  if (isLoading) return <div className="loading" />;
  if (error) return <div className="error-msg">{error}</div>;

  const totalPendiente = pending.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Caja</h1>
          <p className="page-subtitle">
            {pending.length} pedidos pendientes · ${totalPendiente.toFixed(2)} por cobrar
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load}>↻ Actualizar</button>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state">No hay pagos pendientes. Todo al día. ✓</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Mesa</th>
              <th>Total</th>
              <th>Hora</th>
              <th>Método</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700 }}>#{o.order_number}</td>
                <td>{o.table?.number ?? '—'}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>
                  ${Number(o.total).toFixed(2)}
                </td>
                <td>{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                    value={method[o.id] ?? 'efectivo'}
                    onChange={(e) => setMethod({ ...method, [o.id]: e.target.value })}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={paying === o.id}
                    onClick={() => handlePay(o.id, o.total)}
                  >
                    {paying === o.id ? 'Procesando...' : 'Cobrar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
