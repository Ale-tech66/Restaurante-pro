import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { fetchIngredients } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import './Pages.css';

export function Inventory() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', unit: 'unidad', stock: '0', min_stock: '5' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchIngredients(user.restaurant_id);
      setItems(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar inventario');
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurant_id]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', unit: 'unidad', stock: '0', min_stock: '5' });
    setModalOpen(true);
  };

  const openEdit = (i: any) => {
    setEditing(i);
    setForm({ name: i.name, unit: i.unit, stock: i.stock.toString(), min_stock: i.min_stock.toString() });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user?.restaurant_id || !form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        unit: form.unit.trim(),
        stock: parseFloat(form.stock) || 0,
        min_stock: parseFloat(form.min_stock) || 0,
      };
      if (editing) {
        await supabase.from('ingredients').update(payload).eq('id', editing.id);
      } else {
        await supabase.from('ingredients').insert({ restaurant_id: user.restaurant_id, ...payload });
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
    if (!confirm('¿Eliminar este ingrediente?')) return;
    try {
      await supabase.from('ingredients').delete().eq('id', id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo eliminar');
    }
  };

  if (isLoading) return <div className="loading" />;
  if (error && !modalOpen) return <div className="error-msg">{error}</div>;

  const lowStock = items.filter((i) => i.stock <= i.min_stock);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-subtitle">
            {items.length} ingredientes
            {lowStock.length > 0 && (
              <span style={{ color: '#f87171' }}> · {lowStock.length} con stock bajo</span>
            )}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nuevo ingrediente</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">No hay ingredientes registrados.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td style={{ fontWeight: 600 }}>{i.name}</td>
                <td>{i.unit}</td>
                <td style={{ fontWeight: 700 }}>{i.stock}</td>
                <td>{i.min_stock}</td>
                <td>
                  {i.stock <= i.min_stock ? (
                    <span className="badge badge-red">Stock bajo</span>
                  ) : (
                    <span className="badge badge-green">OK</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(i)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editing ? 'Editar ingrediente' : 'Nuevo ingrediente'}</h2>
            {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <input className="form-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, litro, unidad..." />
            </div>
            <div className="form-group">
              <label className="form-label">Stock actual</label>
              <input className="form-input" type="number" step="0.01" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Stock mínimo</label>
              <input className="form-input" type="number" step="0.01" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
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
