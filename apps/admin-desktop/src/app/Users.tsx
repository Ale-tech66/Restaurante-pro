import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { fetchUsers, fetchRoles, inviteStaffUser } from '@/lib/api';
import './Pages.css';

const roleColors: Record<string, string> = {
  admin: 'badge-orange',
  gerente: 'badge-blue',
  cajero: 'badge-green',
  mesero: 'badge-gray',
  cocina: 'badge-red',
};

export function Users() {
  const user = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', fullName: '', roleName: 'mesero' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const [u, r] = await Promise.all([
        fetchUsers(user.restaurant_id),
        fetchRoles(),
      ]);
      setUsers(u ?? []);
      setRoles(r ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async () => {
    if (!user?.restaurant_id || !form.email.trim() || !form.fullName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await inviteStaffUser({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        roleName: form.roleName,
        restaurantId: user.restaurant_id,
      });
      setModalOpen(false);
      setForm({ email: '', fullName: '', roleName: 'mesero' });
      load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo invitar al usuario');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: any) => {
    try {
      const { error: err } = await (await import('@/lib/supabase')).supabase
        .from('users')
        .update({ is_active: !u.is_active })
        .eq('id', u.id);
      if (err) throw err;
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo actualizar');
    }
  };

  if (isLoading) return <div className="loading" />;
  if (error && !modalOpen) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Usuarios y Empleados</h1>
          <p className="page-subtitle">{users.length} usuarios</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Invitar empleado</button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">No hay usuarios registrados.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${roleColors[u.role?.name] ?? 'badge-gray'}`}>
                    {u.role?.name ?? '—'}
                  </span>
                </td>
                <td>
                  {u.is_active ? (
                    <span className="badge badge-green">Activo</span>
                  ) : (
                    <span className="badge badge-red">Inactivo</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(u)}>
                    {u.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Invitar empleado</h2>
            {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Nombre completo *</label>
              <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico *</label>
              <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Rol</label>
              <select className="form-select" value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })}>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleInvite} disabled={saving}>{saving ? 'Invitando...' : 'Invitar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
