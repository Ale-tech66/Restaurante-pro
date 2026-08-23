import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ClipboardList, ReceiptText } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import './Pages.css';

const CHART_COLORS = ['#f97316', '#60a5fa', '#4ade80', '#c084fc', '#fbbf24', '#f87171'];

export function Reports() {
  const user = useAuthStore((s) => s.user);
  const [range, setRange] = useState('semana');
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
            .select('id, total, status, created_at')
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

        // Serie temporal por día
        const byDay: Record<string, number> = {};
        orderList.forEach((o: any) => {
          const day = new Date(o.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
          byDay[day] = (byDay[day] ?? 0) + Number(o.total);
        });
        const salesSeries = Object.entries(byDay).map(([day, total]) => ({ day, total }));

        const byMethod: Record<string, number> = {};
        (payments.data ?? []).forEach((p: any) => {
          byMethod[p.method] = (byMethod[p.method] ?? 0) + Number(p.amount);
        });
        const methodSeries = Object.entries(byMethod).map(([name, value]) => ({ name, value: Number(value) }));

        const productCount: Record<string, { qty: number; revenue: number }> = {};
        (products.data ?? []).forEach((item: any) => {
          const name = item.product?.name ?? 'Producto';
          if (!productCount[name]) productCount[name] = { qty: 0, revenue: 0 };
          productCount[name].qty += item.quantity;
          productCount[name].revenue += item.quantity * Number(item.unit_price);
        });
        const topProducts = Object.entries(productCount)
          .sort((a, b) => b[1].qty - a[1].qty)
          .slice(0, 7)
          .map(([name, info]: any) => ({ name, qty: info.qty, revenue: info.revenue }));

        setData({ totalSales, totalOrders, avgTicket, salesSeries, methodSeries, topProducts });
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

  const kpis = [
    { label: 'Ventas totales', value: data.totalSales, Icon: DollarSign, color: '#4ade80', bg: 'rgba(74,222,128,0.12)', money: true },
    { label: 'Pedidos', value: data.totalOrders, Icon: ClipboardList, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    { label: 'Ticket promedio', value: data.avgTicket, Icon: ReceiptText, color: '#fb923c', bg: 'rgba(249,115,22,0.12)', money: true },
  ];

  return (
    <div>
      <div className="toolbar">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Estadísticas de ventas</p>
        </motion.div>
        <select className="form-select" style={{ width: 'auto' }} value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="hoy">Hoy</option>
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
        </select>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {kpis.map(({ label, value, Icon, color, bg, money }, i) => (
          <motion.div
            key={label}
            className="stat-card"
            style={{ gridColumn: 'span 4', ['--stat-color' as any]: color, ['--stat-bg' as any]: bg, ['--stat-glow' as any]: `${color}22` }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <div className="stat-icon"><Icon size={24} strokeWidth={2} /></div>
            <div>
              <div className="stat-value"><AnimatedNumber value={value} money={money} /></div>
              <div className="stat-label">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ventas por día */}
      <motion.div
        className="data-table-wrap"
        style={{ padding: '22px 10px 10px 0', marginBottom: 20 }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px 22px' }}>Ventas por día</h2>
        {data.salesSeries.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: 14, padding: '24px 22px' }}>Sin ventas en este período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.salesSeries} margin={{ top: 10, right: 20, left: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} width={56} />
              <Tooltip
                contentStyle={{
                  background: '#14161b', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, color: '#f4f4f5', boxShadow: '0 8px 32px rgba(0,0,0,.4)',
                }}
                formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Ventas']}
              />
              <Area type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2.5} fill="url(#salesGrad)" animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 20 }}>
        {/* Métodos de pago */}
        {data.methodSeries.length > 0 && (
          <motion.div
            className="data-table-wrap"
            style={{ padding: '22px' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.35 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Métodos de pago</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.methodSeries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={4}
                  animationDuration={900}
                  stroke="none"
                >
                  {data.methodSeries.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#14161b', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, color: '#f4f4f5',
                  }}
                  formatter={(v: any) => `$${Number(v).toFixed(2)}`}
                />
                <Legend formatter={(v: string) => <span style={{ color: '#a1a1aa', textTransform: 'capitalize', fontSize: 13 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Top productos */}
        {data.topProducts.length > 0 && (
          <motion.div
            className="data-table-wrap"
            style={{ padding: '22px' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.35 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Productos más vendidos</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topProducts} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fill: '#c4c7ce', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: '#14161b', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, color: '#f4f4f5',
                  }}
                  formatter={(v: any) => [v, 'Vendidos']}
                />
                <Bar dataKey="qty" radius={[0, 8, 8, 0]} animationDuration={900} maxBarSize={26}>
                  {data.topProducts.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
