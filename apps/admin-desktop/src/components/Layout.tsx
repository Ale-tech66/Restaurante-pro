import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { claimRestaurantAdmin } from '@/lib/api';
import './Layout.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/orders', label: 'Pedidos', icon: '📋' },
  { path: '/kitchen', label: 'Cocina', icon: '🍳' },
  { path: '/cashier', label: 'Caja', icon: '💵' },
  { path: '/tables', label: 'Mesas', icon: '🪑' },
  { path: '/products', label: 'Productos', icon: '🍽️' },
  { path: '/categories', label: 'Categorías', icon: '📁' },
  { path: '/inventory', label: 'Inventario', icon: '📦' },
  { path: '/users', label: 'Usuarios', icon: '👥' },
  { path: '/reports', label: 'Reportes', icon: '📈' },
  { path: '/settings', label: 'Configuración', icon: '⚙️' },
];

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const [slug, setSlug] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  // Cuenta sin restaurante vinculado: sin esto, todas las pantallas
  // se quedarían con el spinner de carga para siempre.
  if (!user.restaurant_id) {
    const handleClaim = async () => {
      if (!slug.trim()) return;
      setClaiming(true);
      setClaimError('');
      try {
        await claimRestaurantAdmin(slug.trim());
        await refreshUser();
      } catch (err: any) {
        setClaimError(err?.message ?? 'No se pudo reclamar el restaurante');
      } finally {
        setClaiming(false);
      }
    };

    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: 520 }}>
          <div className="auth-logo">🔗</div>
          <h1 className="auth-title">Cuenta sin restaurante</h1>
          <p className="auth-subtitle">
            Hola {user.full_name}, tu cuenta todavía no está vinculada a ningún restaurante.
          </p>

          <div style={{ textAlign: 'left', fontSize: 14, color: '#a1a1aa', lineHeight: 1.6, marginBottom: 20 }}>
            <p><strong style={{ color: '#f4f4f5' }}>Opción A — Soy el dueño:</strong> si creaste un restaurante en Supabase y aún no tiene administrador, escribe su <em>slug</em> para reclamar la administración.</p>
            <p><strong style={{ color: '#f4f4f5' }}>Opción B — Soy personal:</strong> pide al administrador que te invite desde el panel (Usuarios → Invitar).</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleClaim(); }}
            className="auth-form"
          >
            <label className="auth-label">Slug del restaurante (ej. mi-restaurante)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="mi-restaurante"
              className="auth-input"
            />
            {claimError && <div className="auth-error">{claimError}</div>}
            <button type="submit" className="auth-btn" disabled={claiming || !slug.trim()}>
              {claiming ? 'Reclamando...' : 'Reclamar administración'}
            </button>
          </form>

          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            style={{
              marginTop: 12, background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 16px', color: '#a1a1aa', cursor: 'pointer', width: '100%',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🍽️</div>
          <div>
            <div className="sidebar-title">Restaurante Pro</div>
            <div className="sidebar-subtitle">Desktop</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {(user.full_name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="user-name">{user.full_name}</div>
              <div className="user-role">{role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleSignOut}>
            Salir
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
