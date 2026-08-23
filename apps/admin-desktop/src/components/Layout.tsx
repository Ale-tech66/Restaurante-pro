import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
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
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

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
