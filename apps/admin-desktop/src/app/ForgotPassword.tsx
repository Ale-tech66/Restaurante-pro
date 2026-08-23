import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import './Auth.css';

export function ForgotPassword() {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo enviar el correo de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🔐</div>
        <h1 className="auth-title">Recuperar contraseña</h1>
        <p className="auth-subtitle">Te enviaremos un enlace para restablecerla</p>

        {sent ? (
          <>
            <div
              className="auth-error"
              style={{ borderColor: '#4ade80', color: '#4ade80', textAlign: 'center' }}
            >
              ✅ Correo enviado a {email}. Revisa tu bandeja (y spam).
            </div>
            <Link to="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Volver al login
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-label">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="auth-input"
              required
              autoFocus
            />

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
