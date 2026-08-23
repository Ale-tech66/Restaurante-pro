import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';

export function Categories() {
  const user = useAuthStore((s) => s.user);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchCategories(user.restaurant_id);
      setCategories(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.restaurant_id]);

  const openNew = () => {
    setEditing(null);
    setName('');
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setName(c.name);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user?.restaurant_id || !name.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateCategory(editing.id, { name: name.trim() });
      } else {
        await createCategory({ restaurant_id: user.restaurant_id, name: name.trim() });
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo eliminar');
    }
  };

  if (isLoading) return <div className="loading" />;
  if (error && !modalOpen) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">{categories.length} categorías</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nueva categoría</button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">No hay categorías todavía.</div>
      ) : (
        <div className="card-grid">
          {categories.map((c) => (
            <div key={c.id} className="item-card" onClick={() => openEdit(c)}>
              <div className="item-card-title">{c.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                {c.is_active
                  ? <span className="badge badge-green">Activa</span>
                  : <span className="badge badge-gray">Inactiva</span>}
                <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
            {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
