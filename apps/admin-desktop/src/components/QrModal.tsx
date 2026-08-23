import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Printer, Download, RefreshCw, X, Copy, Check } from 'lucide-react';
import {
  fetchTableQr,
  generateTableQr,
  regenerateTableQr,
} from '@/lib/api';
import '@/styles/qr.css';

interface QrModalProps {
  table: { id: string; number: string; capacity: number };
  restaurantName: string;
  onClose: () => void;
}

export function QrModal({ table, restaurantName, onClose }: QrModalProps) {
  const [qr, setQr] = useState<any>(null);
  const [dataUrl, setDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let row = await fetchTableQr(table.id);
        if (!row) row = await generateTableQr(table.id);
        setQr(row);
      } catch (err: any) {
        setError(err?.message ?? 'No se pudo obtener el código QR');
      } finally {
        setLoading(false);
      }
    })();
  }, [table.id]);

  useEffect(() => {
    if (!qr?.token) return;
    QRCode.toDataURL(qr.token, {
      width: 640,
      margin: 2,
      color: { dark: '#0f1115', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setDataUrl).catch(() => setError('No se pudo generar la imagen del QR'));
  }, [qr?.token]);

  const handleRegenerate = async () => {
    if (!confirm('¿Generar un código nuevo? El anterior dejará de funcionar.')) return;
    setLoading(true);
    setError('');
    try {
      const row = await regenerateTableQr(table.id, qr.id);
      setQr(row);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo regenerar');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!qr?.token) return;
    await navigator.clipboard.writeText(qr.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-mesa-${table.number}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Tarjeta imprimible: visible en pantalla dentro del modal y AL IMPRIMIR */}
      <motion.div
        className="modal-card qr-modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <div className="qr-print-area">
          <button className="modal-close no-print" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>

          <div className="qr-print-header">
            <div className="qr-brand">🍽️ {restaurantName}</div>
            <h2 className="qr-table-name">Mesa {table.number}</h2>
            <p className="qr-hint">Escanea para ver el menú y pedir</p>
          </div>

          {loading ? (
            <div className="loading" style={{ margin: '24px auto' }} />
          ) : error ? (
            <div className="error-msg">{error}</div>
          ) : (
            <>
              <img src={dataUrl} alt={`QR mesa ${table.number}`} className="qr-image" />
              <button className="qr-token no-print" onClick={handleCopy} title="Copiar código">
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {qr.token}
              </button>
              <p className="qr-capacity">Capacidad: {table.capacity} personas</p>
            </>
          )}
        </div>

        {!loading && !error && (
          <div className="modal-actions no-print" style={{ marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={handleRegenerate}>
              <RefreshCw size={15} /> Regenerar
            </button>
            <button className="btn btn-secondary" onClick={handleDownload}>
              <Download size={15} /> Descargar PNG
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={15} /> Imprimir
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
