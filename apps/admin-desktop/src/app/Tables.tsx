import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, QrCode, Armchair } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { fetchTables, createTable, updateTable, deleteTable } from '@/lib/api';
import { QrModal } from '@/components/QrModal';

const statusColors: Record<string, string> = {
  libre: 'badge-green',
  ocupada: 'badge-orange',
  esperando_pago: 'badge-red',
  reservada: 'badge-blue',
  fuera_servicio: 'badge-gray',
};
const statusLabels: Record<string, string> = {
  libre: 'Libre',
  ocupada: 'Ocupada',
  esperando_pago: 'Esperando pago',
  reservada: 'Reservada',
  fuera_servicio: 'Fuera de servicio',
};

export function Tables() {
  const user = useAuthStore((s) => s.user);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [qrTable, setQrTable] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user?.restaurant_id) return;
    try {
      const data = await fetchTables(user.restaurant_id);
      setTables(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.restaurant_id]);

  const openNew = () => {
    setEditing(null);
    setNumber('');
    setCapacity('4');
    setModalOpen(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setNumber(t.number);
    setCapacity(t.capacity.toString());
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user?.restaurant_id || !number.trim()) return;
    setSaving(true);
    setError('');
    try {
      const cap = parseInt(capacity) || 4;
      if (editing) {
        await updateTable(editing.id, { number: number.trim(), capacity: cap });
      } else {
        await createTable({ restaurant_id: user.restaurant_id, number: number.trim(), capacity: cap });
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
    if (!confirm('¿Eliminar esta mesa?')) return;
    try {
      await deleteTable(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
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
          <h1 className="page-title">Mesas</h1>
          <p className="page-subtitle">{tables.length} mesas registradas</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Nueva mesa
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="empty-state">
          <Armchair size={40} strokeWidth={1.5} />
          <p>No hay mesas registradas.</p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Crea tu primera mesa para generar su código QR.
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {tables.map((t, i) => (
            <motion.div
              key={t.id}
              className="item-card"
              onClick={() => openEdit(t)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileHover={{ y: -3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="item-card-title">{t.number}</div>
                  <div className="item-card-sub">Capacidad: {t.capacity}</div>
                </div>
                <span className={`badge ${statusColors[t.status] ?? 'badge-gray'}`}>
                  {statusLabels[t.status] ?? t.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => { e.stopPropagation(); setQrTable(t); }}
                  title="Ver e imprimir QR"
                >
                  <QrCode size={14} /> QR
                </button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(t); }}>
                  <Pencil size={14} /> Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <motion.div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <h2 className="modal-title">{editing ? 'Editar mesa' : 'Nueva mesa'}</h2>
            {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Número / Nombre *</label>
              <input className="form-input" value={number} onChange={(e) => setNumber(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Capacidad</label>
              <input className="form-input" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {qrTable && (
        <QrModal
          table={qrTable}
          restaurantName={user?.restaurant_name || user?.full_name || 'Restaurante Pro'}
          onClose={() => { setQrTable(null); load(); }}
        />
      )}
    </div>
  );
}
