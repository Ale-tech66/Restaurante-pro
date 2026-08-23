import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { fetchDashboardStats } from '@/lib/api';
import './Pages.css';

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

  const cards = [
    { label: 'Ventas de hoy', value: `$${stats.salesToday.toFixed(2)}`, icon: '💰', color: '#166534' },
    { label: 'Pedidos hoy', value: stats.ordersTodayCount, icon: '📋', color: '#1e3a8a' },
    { label: 'Pedidos pendientes', value: stats.pendingOrders, icon: '⏳', color: '#7c2d12' },
    { label: 'Productos', value: stats.productsCount, icon: '🍽️', color: '#78350f' },
    { label: 'Mesas', value: stats.tablesCount, icon: '🪑', color: '#1c1f26' },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Bienvenido, {user?.full_name}</p>

      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
