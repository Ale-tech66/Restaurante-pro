import { useState } from 'react';
import { Utensils } from 'lucide-react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import './Auth.css';

export function Login() {
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo iniciar sesión');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo"><Utensils size={26} strokeWidth={2.2} /></div>
        <h1 className="auth-title">Restaurante Pro</h1>
        <p className="auth-subtitle">Panel de administración</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@restaurante.com"
            className="auth-input"
            required
            autoFocus
          />

          <label className="auth-label">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input"
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            ¿No tienes cuenta? <strong>Regístrate</strong>
          </Link>
          <Link to="/forgot-password" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </div>
  );
}
