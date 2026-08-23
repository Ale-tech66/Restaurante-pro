import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { THEMES, THEME_ORDER, getStoredTheme, applyTheme } from '@/lib/theme';
import type { ThemeName } from '@restaurante-pro/shared';
import './Pages.css';

export function Settings() {
  const user = useAuthStore((s) => s.user);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    currency: 'USD',
    tax_rate: '0',
  });

  const [theme, setTheme] = useState<ThemeName>(() => getStoredTheme());

  const handleTheme = (t: ThemeName) => {
    setTheme(t);
    applyTheme(t);
  };

  useEffect(() => {
    if (!user?.restaurant_id) return;
    const load = async () => {
      try {
        const { data, error: err } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', user.restaurant_id)
          .single();
        if (err) throw err;
        setRestaurant(data);
        setForm({
          name: data.name ?? '',
          address: data.address ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          currency: data.currency ?? 'USD',
          tax_rate: (data.tax_rate ?? 0).toString(),
        });
      } catch (err: any) {
        setError(err?.message ?? 'Error al cargar configuración');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.restaurant_id]);

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { error: err } = await supabase
        .from('restaurants')
        .update({
          name: form.name.trim(),
          address: form.address.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          currency: form.currency.trim(),
          tax_rate: parseFloat(form.tax_rate) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurant.id);
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="loading" />;
  if (error && !restaurant) return <div className="error-msg">{error}</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Datos del restaurante</p>
        </div>
      </div>

      {/* ============================================================
          Selector de tema
          ============================================================ */}
      <motion.div
        className="data-table-wrap"
        style={{ padding: 22, marginBottom: 32 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
          <Palette size={19} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Elige tu tema</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {THEME_ORDER.map((key) => {
            const t = THEMES[key];
            const active = theme === key;
            return (
              <motion.button
                key={key}
                onClick={() => handleTheme(key)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  position: 'relative',
                  background: active ? 'var(--primary-soft)' : 'var(--surface)',
                  border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'inherit',
                  transition: 'border-color .15s ease',
                }}
              >
                {/* Muestra de colores del tema */}
                <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                  {[t.bg, t.primary, t.text].map((c, i) => (
                    <span
                      key={i}
                      style={{
                        width: 22, height: 22, borderRadius: 7,
                        background: c,
                        border: '1px solid var(--border)',
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.name}
                  {active && <Check size={14} style={{ color: 'var(--primary)' }} />}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>
                  {t.description}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
      {saved && (
        <div style={{
          background: 'rgba(74, 222, 128, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 18px',
          color: '#4ade80',
          fontSize: 14,
          marginBottom: 16,
        }}>
          ✓ Configuración guardada correctamente
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Nombre del restaurante *</label>
        <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Dirección</label>
        <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Teléfono</label>
        <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Moneda</label>
        <input className="form-input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="USD, MXN, EUR..." />
      </div>
      <div className="form-group">
        <label className="form-label">Tasa de impuesto (%)</label>
        <input className="form-input" type="number" step="0.01" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
