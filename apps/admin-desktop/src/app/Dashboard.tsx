import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ClipboardList, TimerReset, UtensilsCrossed, Armchair } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { fetchDashboardStats } from '@/lib/api';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import './Pages.css';

const cardDefs = [
  { key: 'salesToday', label: 'Ventas de hoy', Icon: DollarSign, span: 4, color: '#4ade80', bg: 'rgba(74,222,128,0.12)', glow: 'rgba(74,222,128,0.14)', money: true },
  { key: 'ordersTodayCount', label: 'Pedidos hoy', Icon: ClipboardList, span: 4, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', glow: 'rgba(96,165,250,0.14)' },
  { key: 'pendingOrders', label: 'Pendientes', Icon: TimerReset, span: 4, color: '#fb923c', bg: 'rgba(249,115,22,0.12)', glow: 'rgba(249,115,22,0.14)' },
  { key: 'productsCount', label: 'Productos activos', Icon: UtensilsCrossed, span: 6, color: '#c084fc', bg: 'rgba(192,132,252,0.12)', glow: 'rgba(192,132,252,0.14)' },
  { key: 'tablesCount', label: 'Mesas registradas', Icon: Armchair, span: 6, color: '#f4f4f5', bg: 'rgba(244,244,245,0.09)', glow: 'rgba(255,255,255,0.06)' },
];

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.restaurant_id) return;
    fetchDashboardStats(user.restaurant_id)
      .then(setStats)
      .catch((err) => setError(err?.message ?? 'Error al cargar datos'))
      .finally(() => setIsLoading(false));
  }, [user?.restaurant_id]);

  if (isLoading) return <div className="loading" />;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bienvenido, {user?.full_name}</p>
      </motion.div>

      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {cardDefs.map(({ key, label, Icon, span, color, bg, glow, money }, i) => (
          <motion.div
            key={key}
            className="stat-card"
            style={{
              gridColumn: `span ${span}`,
              ['--stat-color' as any]: color,
              ['--stat-bg' as any]: bg,
              ['--stat-glow' as any]: glow,
            }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="stat-icon"><Icon size={24} strokeWidth={2} /></div>
            <div>
              <div className="stat-value">
                <AnimatedNumber value={stats?.[key] ?? 0} money={money} />
              </div>
              <div className="stat-label">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
