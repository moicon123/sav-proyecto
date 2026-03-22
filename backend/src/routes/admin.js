import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getUsers, getRecargas, getRetiros, getLevels, findUserById, updateUser, getPublicContent, getMetodosQr, getBanners, getAllTasks } from '../lib/queries.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { supabase } from '../lib/db.js';

const router = Router();
router.use(authenticate);
router.use(requireAdmin);

function sanitizeUser(u, levels) {
  const level = levels.find(l => l.id === u.nivel_id);
  return {
    id: u.id,
    telefono: u.telefono,
    nombre_usuario: u.nombre_usuario,
    nombre_real: u.nombre_real,
    codigo_invitacion: u.codigo_invitacion,
    nivel: level?.nombre,
    nivel_id: u.nivel_id,
    saldo_principal: u.saldo_principal,
    saldo_comisiones: u.saldo_comisiones,
    rol: u.rol,
    bloqueado: u.bloqueado,
    created_at: u.created_at,
  };
}

router.get('/dashboard', async (req, res) => {
  const users = await getUsers();
  const recargas = await getRecargas();
  const retiros = await getRetiros();
  
  const totalUsuarios = users.filter(u => u.rol === 'usuario').length;
  const totalRecargas = recargas.reduce((s, r) => s + (r.monto || 0), 0);
  const totalRetiros = retiros.reduce((s, r) => s + (r.monto || 0), 0);
  const pendientesRetiro = retiros.filter(r => r.estado === 'pendiente').length;
  const pendientesRecarga = recargas.filter(r => r.estado === 'pendiente').length;
  
  res.json({
    total_usuarios: totalUsuarios,
    total_recargas: totalRecargas,
    total_retiros: totalRetiros,
    pendientes_retiro: pendientesRetiro,
    pendientes_recarga: pendientesRecarga,
  });
});

router.get('/usuarios', async (req, res) => {
  const users = await getUsers();
  const levels = await getLevels();
  const filtered = users.filter(u => u.rol === 'usuario').map(u => sanitizeUser(u, levels));
  res.json(filtered);
});

router.get('/recargas', async (req, res) => {
  const recargas = await getRecargas();
  res.json(recargas);
});

router.post('/recargas/:id/aprobar', async (req, res) => {
  const { id } = req.params;
  
  const { data: recarga } = await supabase.from('recargas').select('*').eq('id', id).single();
  if (!recarga) return res.status(404).json({ error: 'Recarga no encontrada' });
  if (recarga.estado === 'aprobada') return res.status(400).json({ error: 'Ya aprobada' });

  const updates = {
    estado: 'aprobada',
    procesado_por: req.user.id,
    procesado_at: new Date().toISOString()
  };
  await supabase.from('recargas').update(updates).eq('id', id);

  const user = await findUserById(recarga.usuario_id);
  if (user) {
    const userUpdates = {
      saldo_comisiones: (user.saldo_comisiones || 0) + recarga.monto
    };

    // Lógica de subida de nivel automática basada en el monto de la recarga
    const niveles = await getLevels();
    // Buscamos el nivel que corresponde exactamente al monto de la recarga (si es Compra VIP)
    if (recarga.modo === 'Compra VIP') {
      const nuevoNivel = niveles.find(n => n.costo === recarga.monto);
      if (nuevoNivel) {
        userUpdates.nivel_id = nuevoNivel.id;
        console.log(`Subiendo usuario ${user.nombre_usuario} al nivel ${nuevoNivel.id} automáticamente por recarga de ${recarga.monto}`);
      }
    }

    await updateUser(user.id, userUpdates);
  }

  res.json({ ok: true });
});

router.post('/recargas/:id/rechazar', async (req, res) => {
  const { id } = req.params;
  const updates = {
    estado: 'rechazada',
    procesado_por: req.user.id,
    procesado_at: new Date().toISOString(),
    admin_notas: req.body.motivo || ''
  };
  await supabase.from('recargas').update(updates).eq('id', id);
  res.json({ ok: true });
});

router.get('/retiros', async (req, res) => {
  const retiros = await getRetiros();
  res.json(retiros);
});

router.post('/retiros/:id/aprobar', async (req, res) => {
  const { id } = req.params;
  const updates = {
    estado: 'aprobado',
    procesado_por: req.user.id,
    procesado_at: new Date().toISOString()
  };
  await supabase.from('retiros').update(updates).eq('id', id);
  res.json({ ok: true });
});

router.post('/retiros/:id/rechazar', async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  const { data: retiro } = await supabase.from('retiros').select('*').eq('id', id).single();
  if (!retiro) return res.status(404).json({ error: 'No encontrado' });

  const updates = {
    estado: 'rechazado',
    procesado_por: req.user.id,
    procesado_at: new Date().toISOString(),
    admin_notas: motivo || ''
  };
  
  await supabase.from('retiros').update(updates).eq('id', id);
  
  const user = await findUserById(retiro.usuario_id);
  if (user) {
    const balanceField = retiro.tipo_billetera === 'comisiones' ? 'saldo_comisiones' : 'saldo_principal';
    await updateUser(user.id, {
      [balanceField]: (user[balanceField] || 0) + retiro.monto
    });
  }
  
  res.json({ ok: true });
});

router.get('/tareas', async (req, res) => {
  const data = await getAllTasks();
  res.json(data);
});

router.post('/tareas', async (req, res) => {
  const { nombre, nivel_id, video_url, respuesta_correcta, opciones, recompensa } = req.body;
  const tarea = {
    id: uuidv4(),
    nombre,
    nivel_id,
    video_url,
    respuesta_correcta,
    opciones: Array.isArray(opciones) ? opciones : [],
    recompensa: parseFloat(recompensa) || 0,
    activa: true,
    created_at: new Date().toISOString()
  };
  
  const { data, fallback } = await trySupabase(() => supabase.from('tareas').insert([tarea]).select().single());
  if (!fallback) return res.json(data);
  
  const store = await getStore();
  if (!store.tasks) store.tasks = [];
  store.tasks.push(tarea);
  res.json(tarea);
});

router.put('/tareas/:id', async (req, res) => {
  const { nombre, nivel_id, video_url, respuesta_correcta, opciones, recompensa, activa } = req.body;
  const updates = {};
  if (nombre !== undefined) updates.nombre = nombre;
  if (nivel_id !== undefined) updates.nivel_id = nivel_id;
  if (video_url !== undefined) updates.video_url = video_url;
  if (respuesta_correcta !== undefined) updates.respuesta_correcta = respuesta_correcta;
  if (opciones !== undefined) updates.opciones = Array.isArray(opciones) ? opciones : [];
  if (recompensa !== undefined) updates.recompensa = parseFloat(recompensa) || 0;
  if (activa !== undefined) updates.activa = activa;

  const { data, fallback } = await trySupabase(() => supabase.from('tareas').update(updates).eq('id', req.params.id).select().single());
  if (!fallback) return res.json(data);
  
  const store = await getStore();
  const t = (store.tasks || []).find(x => x.id === req.params.id);
  if (t) Object.assign(t, updates);
  res.json(t || { error: 'Not found' });
});

router.delete('/tareas/:id', async (req, res) => {
  const { fallback } = await trySupabase(() => supabase.from('tareas').delete().eq('id', req.params.id));
  if (!fallback) return res.json({ ok: true });
  
  const store = await getStore();
  const idx = (store.tasks || []).findIndex(x => x.id === req.params.id);
  if (idx !== -1) store.tasks.splice(idx, 1);
  res.json({ ok: true });
});


router.get('/metodos-qr', async (req, res) => {
  const metodos = await getMetodosQr();
  res.json(metodos);
});

router.post('/metodos-qr', async (req, res) => {
  const { nombre_titular, imagen_base64 } = req.body;
  const store = await getStore();
  const metodo = {
    id: uuidv4(),
    nombre_titular: nombre_titular || 'Nuevo método',
    imagen_qr_url: imagen_base64 || '',
    imagen_base64: imagen_base64 || null,
    activo: true,
    orden: (await getMetodosQr()).length,
    created_at: new Date().toISOString()
  };

  const { data, fallback } = await trySupabase(() => supabase.from('metodos_qr').insert([metodo]).select().single());
  if (!fallback) return res.json(data);

  if (!store.metodosQr) store.metodosQr = [];
  store.metodosQr.push(metodo);
  res.json(metodo);
});

router.delete('/metodos-qr/:id', async (req, res) => {
  const { id } = req.params;
  const { fallback } = await trySupabase(() => supabase.from('metodos_qr').delete().eq('id', id));
  if (!fallback) return res.json({ ok: true });

  const store = await getStore();
  const idx = (store.metodosQr || []).findIndex(x => x.id === id);
  if (idx !== -1) store.metodosQr.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/banners', async (req, res) => {
  const banners = await getBanners();
  res.json(banners);
});

router.post('/banners', async (req, res) => {
  const { imagen_url, orden } = req.body;
  const banner = {
    id: uuidv4(),
    imagen_url,
    orden: parseInt(orden) || 0,
    activo: true,
    created_at: new Date().toISOString()
  };

  const { data, fallback } = await trySupabase(() => supabase.from('banners_carrusel').insert([banner]).select().single());
  if (!fallback) return res.json(data);

  const store = await getStore();
  if (!store.banners) store.banners = [];
  store.banners.push(banner);
  res.json(banner);
});

router.delete('/banners/:id', async (req, res) => {
  const { id } = req.params;
  const { fallback } = await trySupabase(() => supabase.from('banners_carrusel').delete().eq('id', id));
  if (!fallback) return res.json({ ok: true });

  const store = await getStore();
  const idx = (store.banners || []).findIndex(x => x.id === id);
  if (idx !== -1) store.banners.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/premios-ruleta', async (req, res) => {
  const { data } = await supabase.from('premios_ruleta').select('*').order('orden', { ascending: true });
  res.json(data || []);
});

router.get('/public-content', async (req, res) => {
  const config = await getPublicContent();
  res.json(config);
});

export default router;
