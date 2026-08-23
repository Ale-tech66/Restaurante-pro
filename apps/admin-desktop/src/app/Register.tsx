import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import './Auth.css';

export function Register() {
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await signUp(email.trim(), password, fullName.trim());
      setInfo(
        'Cuenta creada. Si tu Supabase requiere confirmación por correo, revísalo y luego inicia sesión.'
      );
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo registrar la cuenta');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo"><Utensils size={26} strokeWidth={2.2} /></div>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Restaurante Pro — Panel de administración</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            className="auth-input"
            required
            autoFocus
          />

          <label className="auth-label">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="auth-input"
            required
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

          <label className="auth-label">Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input"
            required
          />

          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-error" style={{ borderColor: '#4ade80', color: '#4ade80' }}>{info}</div>}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
