import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, CookingPot, Wallet, Armchair,
  UtensilsCrossed, FolderOpen, Package, Users as UsersIcon,
  TrendingUp, Settings as SettingsIcon, LogOut, Utensils,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { claimRestaurantAdmin, createRestaurant } from '@/lib/api';
import './Layout.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/orders', label: 'Pedidos', Icon: ClipboardList },
  { path: '/kitchen', label: 'Cocina', Icon: CookingPot },
  { path: '/cashier', label: 'Caja', Icon: Wallet },
  { path: '/tables', label: 'Mesas', Icon: Armchair },
  { path: '/products', label: 'Productos', Icon: UtensilsCrossed },
  { path: '/categories', label: 'Categorías', Icon: FolderOpen },
  { path: '/inventory', label: 'Inventario', Icon: Package },
  { path: '/users', label: 'Usuarios', Icon: UsersIcon },
  { path: '/reports', label: 'Reportes', Icon: TrendingUp },
  { path: '/settings', label: 'Configuración', Icon: SettingsIcon },
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
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

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

    const handleCreate = async () => {
      const name = newName.trim();
      if (!name) return;
      setCreating(true);
      setCreateError('');
      try {
        // RPC atómica: crea el restaurante y vincula al usuario como admin
        await createRestaurant({ name });
        await refreshUser();
      } catch (err: any) {
        setCreateError(err?.message ?? 'No se pudo crear el restaurante');
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: 560 }}>
          <div className="auth-logo">
            <Utensils size={28} strokeWidth={2.2} />
          </div>
          <h1 className="auth-title">Configura tu restaurante</h1>
          <p className="auth-subtitle">
            Hola {user.full_name}, tu cuenta todavía no está vinculada a ningún restaurante.
          </p>

          <div style={{ textAlign: 'left', fontSize: 14, color: '#a1a1aa', lineHeight: 1.6, marginBottom: 20 }}>
            <p><strong style={{ color: '#f4f4f5' }}>🆕 Crear uno nuevo</strong> — empieza desde cero con tu propio restaurante (recomendado si es tu primera vez).</p>
            <p><strong style={{ color: '#f4f4f5' }}>🔑 Reclamar existente</strong> — si alguien ya creó el restaurante en Supabase y aún no tiene administrador.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="auth-form" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <label className="auth-label">Nombre de tu restaurante</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Tacos La Doña"
              className="auth-input"
              required
            />
            {createError && <div className="auth-error">{createError}</div>}
            <button type="submit" className="auth-btn" disabled={creating || !newName.trim()}>
              {creating ? 'Creando...' : '🆕 Crear mi restaurante'}
            </button>
          </form>

          <details style={{ marginTop: 16, color: '#a1a1aa', fontSize: 13 }}>
            <summary style={{ cursor: 'pointer' }}>Reclamar un restaurante ya existente</summary>
            <form onSubmit={(e) => { e.preventDefault(); handleClaim(); }} className="auth-form" style={{ marginTop: 12 }}>
              <label className="auth-label">Slug del restaurante</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mi-restaurante"
                className="auth-input"
              />
              {claimError && <div className="auth-error">{claimError}</div>}
              <button type="submit" className="auth-btn" disabled={claiming || !slug.trim()}>
                {claiming ? 'Reclamando...' : '🔑 Reclamar administración'}
              </button>
            </form>
          </details>

          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            style={{
              marginTop: 16, background: 'transparent', border: '1px solid var(--border)',
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
          <div className="sidebar-logo">
            <Utensils size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="sidebar-title">Restaurante Pro</div>
            <div className="sidebar-subtitle">{user.restaurant_name || 'Desktop'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <span className="nav-icon"><Icon size={18} strokeWidth={2} /></span>
              <span>{label}</span>
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
            <LogOut size={15} /> Salir
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
