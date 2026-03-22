import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMetodosQr, getRecargasByUser, createRecarga, getPublicContent, findUserById } from '../lib/queries.js';
import { authenticate } from '../middleware/auth.js';
import { mergePublicContent } from '../data/publicContentDefaults.js';
import { isScheduleOpen } from '../lib/schedule.js';
import { telegram } from '../lib/telegram.js';

const router = Router();

router.get('/metodos', async (req, res) => {
  const metodos = await getMetodosQr();
  res.json(metodos.map(m => ({ id: m.id, nombre_titular: m.nombre_titular, imagen_qr_url: m.imagen_qr_url, imagen_base64: m.imagen_base64 })));
});

router.get('/', authenticate, async (req, res) => {
  const list = await getRecargasByUser(req.user.id);
  res.json(list);
});

router.post('/', authenticate, async (req, res) => {
  const { monto, metodo_qr_id, comprobante_url, modo } = req.body;
  const config = await getPublicContent();
  const pc = mergePublicContent(config);
  const sched = isScheduleOpen(pc.horario_recarga);
  if (!sched.ok) {
    return res.status(400).json({
      error: `Intento de recargar fuera del horario: ${sched.message}`,
    });
  }
  const user = await findUserById(req.user.id);
  const recarga = {
    id: uuidv4(),
    usuario_id: req.user.id,
    metodo_qr_id: metodo_qr_id || null,
    monto: parseFloat(monto) || 0,
    comprobante_url: comprobante_url || '',
    modo: modo || 'Compra VIP',
    estado: 'pendiente',
    created_at: new Date().toISOString(),
  };
  await createRecarga(recarga);

  // Notificar por Telegram (Bot de Recargas)
  const msg = `🔔 *Nueva Recarga Pendiente*\n` +
    `👤 Usuario: ${user?.nombre_usuario || req.user.id}\n` +
    `💰 Monto: ${recarga.monto} BOB\n` +
    `🛠 Modo: ${recarga.modo}\n` +
    `🕒 Fecha: ${new Date(recarga.created_at).toLocaleString()}`;
  
  if (recarga.comprobante_url && recarga.comprobante_url.startsWith('data:image')) {
    telegram.sendRecargaConFoto(msg, recarga.comprobante_url).catch(console.error);
  } else {
    telegram.sendRecarga(msg).catch(console.error);
  }

  res.json(recarga);
});

export default router;
