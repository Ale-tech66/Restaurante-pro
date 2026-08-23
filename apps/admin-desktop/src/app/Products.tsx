import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '@/lib/api';

export function Products() {
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', is_available: true, is_featured: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user?.restaurant_id) return;
    try {
      const [prods, cats] = await Promise.all([
        fetchProducts(user.restaurant_id),
        fetchCategories(user.restaurant_id),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.restaurant_id]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', category_id: '', is_available: true, is_featured: false });
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price.toString(),
      category_id: p.category_id ?? '',
      is_available: p.is_available,
      is_featured: p.is_featured,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user?.restaurant_id) return;
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) { setError('Precio inválido'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: priceNum,
        category_id: form.category_id || null,
        is_available: form.is_available,
        is_featured: form.is_featured,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct({ restaurant_id: user.restaurant_id, ...payload });
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
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
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
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">{products.length} productos registrados</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nuevo producto</button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">No hay productos todavía. Crea el primero.</div>
      ) : (
        <div className="card-grid">
          {products.map((p) => (
            <div key={p.id} className="item-card" onClick={() => openEdit(p)}>
              <div className="item-card-title">{p.name}</div>
              <div className="item-card-sub">{p.description ?? 'Sin descripción'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>${p.price.toFixed(2)}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {p.is_available
                    ? <span className="badge badge-green">Disponible</span>
                    : <span className="badge badge-red">Agotado</span>}
                  {p.is_featured && <span className="badge badge-orange">★</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
            {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Precio *</label>
              <input className="form-input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} /> Disponible
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Destacado
              </label>
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
