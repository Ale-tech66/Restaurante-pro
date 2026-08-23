// ============================================================
// Restaurante Pro Desktop — Preload
// ============================================================
// Expone APIs seguras al renderer sin habilitar nodeIntegration
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});
