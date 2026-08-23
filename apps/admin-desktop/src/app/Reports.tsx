import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import './Pages.css';

export function Reports() {
  const user = useAuthStore((s) => s.user);
  const [range, setRange] = useState('hoy');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.restaurant_id) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const now = new Date();
        let start = new Date();
        if (range === 'hoy') start.setHours(0, 0, 0, 0);
        else if (range === 'semana') start.setDate(now.getDate() - 7);
        else if (range === 'mes') start.setMonth(now.getMonth() - 1);

        const startISO = start.toISOString();

        const [orders, products, payments] = await Promise.all([
          supabase
            .from('orders')
            .select('id, total, status, created_at, table:tables(number)')
            .eq('restaurant_id', user.restaurant_id)
            .gte('created_at', startISO)
            .order('created_at', { ascending: false }),
          supabase
            .from('order_items')
            .select('quantity, unit_price, product:products(name)')
            .in('order_id',
              (await supabase.from('orders').select('id').eq('restaurant_id', user.restaurant_id).gte('created_at', startISO)).data?.map((o: any) => o.id) ?? []
            ),
          supabase
            .from('payments')
            .select('method, amount')
            .eq('restaurant_id', user.restaurant_id)
            .gte('created_at', startISO),
        ]);

        if (orders.error) throw orders.error;

        const orderList = orders.data ?? [];
        const totalSales = orderList.reduce((s, o) => s + Number(o.total), 0);
        const totalOrders = orderList.length;
        const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        const byMethod: Record<string, number> = {};
        (payments.data ?? []).forEach((p: any) => {
          byMethod[p.method] = (byMethod[p.method] ?? 0) + Number(p.amount);
        });

        const productCount: Record<string, { qty: number; revenue: number }> = {};
        (products.data ?? []).forEach((item: any) => {
          const name = item.product?.name ?? 'Producto';
          if (!productCount[name]) productCount[name] = { qty: 0, revenue: 0 };
          productCount[name].qty += item.quantity;
          productCount[name].revenue += item.quantity * Number(item.unit_price);
        });
        const topProducts = Object.entries(productCount)
          .sort((a, b) => b[1].qty - a[1].qty)
          .slice(0, 10);

        setData({ totalSales, totalOrders, avgTicket, byMethod, topProducts });
      } catch (err: any) {
        setError(err?.message ?? 'Error al cargar reportes');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.restaurant_id, range]);

  if (isLoading) return <div className="loading" />;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Estadísticas de ventas</p>
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="hoy">Hoy</option>
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
        </select>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card" style={{ borderLeftColor: '#166534' }}>
          <div className="stat-icon">💰</div>
          <div>
            <div className="stat-value">${data.totalSales.toFixed(2)}</div>
            <div className="stat-label">Ventas totales</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#1e3a8a' }}>
          <div className="stat-icon">📋</div>
          <div>
            <div className="stat-value">{data.totalOrders}</div>
            <div className="stat-label">Pedidos</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#78350f' }}>
          <div className="stat-icon">📊</div>
          <div>
            <div className="stat-value">${data.avgTicket.toFixed(2)}</div>
            <div className="stat-label">Ticket promedio</div>
          </div>
        </div>
      </div>

      {Object.keys(data.byMethod).length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Ventas por método de pago</h2>
          <table className="data-table">
            <thead>
              <tr><th>Método</th><th>Total</th></tr>
            </thead>
            <tbody>
{Object.entries(data.byMethod).map(([m, total]) => {
                  const amount = Number(total);
                  return (
                <tr key={m}>
                  <td style={{ textTransform: 'capitalize' }}>{m}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${amount.toFixed(2)}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {data.topProducts.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Productos más vendidos</h2>
          <table className="data-table">
            <thead>
              <tr><th>Producto</th><th>Cantidad</th><th>Ingresos</th></tr>
            </thead>
            <tbody>
              {data.topProducts.map(([name, info]: any) => (
                <tr key={name}>
                  <td style={{ fontWeight: 600 }}>{name}</td>
                  <td>{info.qty}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${info.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
