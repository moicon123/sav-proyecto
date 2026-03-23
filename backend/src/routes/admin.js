import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getUsers, getRecargas, getRetiros, getLevels, findUserById, updateUser, getPublicContent, getMetodosQr, getBanners, getAllTasks, getRecargaById, updateRecarga, getRetiroById, updateRetiro, trySupabase } from '../lib/queries.js';
import { getStore } from '../data/store.js';
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
    nivel_codigo: level?.codigo,
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
  const filtered = users.map(u => sanitizeUser(u, levels));
  res.json(filtered);
});

router.post('/usuarios/:id/password', async (req, res) => {
  const { id } = req.params;
  const { password, password_fondo } = req.body;
  const updates = {};
  
  if (password) {
    updates.password_hash = await bcrypt.hash(password, 10);
  }
  if (password_fondo) {
    updates.password_fondo_hash = await bcrypt.hash(password_fondo, 10);
  }
  
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Nada que actualizar' });
  
  await updateUser(id, updates);
  res.json({ ok: true });
});

router.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  await updateUser(id, updates);
  res.json({ ok: true });
});

router.get('/recargas', async (req, res) => {
  const recargas = await getRecargas();
  res.json(recargas);
});

router.post('/recargas/:id/aprobar', async (req, res) => {
  const { id } = req.params;
  
  const recarga = await getRecargaById(id);
  if (!recarga) {
    return res.status(404).json({ error: 'Recarga no encontrada en el sistema (Verifica si está en la DB o memoria local)' });
  }
  
  if (recarga.estado === 'aprobada') return res.status(400).json({ error: 'Esta recarga ya fue aprobada previamente' });

  const updates = {
    estado: 'aprobada',
    procesado_at: new Date().toISOString()
  };
  
  // Solo agregar procesado_por si el usuario admin existe en la DB (evitar errores de FK en Supabase)
  if (req.user && req.user.id) {
    const adminExists = await findUserById(req.user.id);
    if (adminExists) {
      updates.procesado_por = req.user.id;
    }
  }
  
  const updatedRecarga = await updateRecarga(id, updates);
  if (!updatedRecarga) {
    return res.status(500).json({ error: 'Error al actualizar el estado de la recarga' });
  }

  const user = await findUserById(recarga.usuario_id);
  if (user) {
    const userUpdates = {};

    if (recarga.modo === 'Compra VIP') {
      const niveles = await getLevels();
      const nuevoNivel = niveles.find(n => (n.deposito || n.costo) === recarga.monto);
      if (nuevoNivel) {
        userUpdates.nivel_id = nuevoNivel.id;
      }
      // Al ser Compra VIP, NO sumamos el monto al saldo_principal, solo actualizamos el nivel.
    } else {
      // Si no es Compra VIP, sumamos el saldo normalmente
      userUpdates.saldo_principal = (user.saldo_principal || 0) + recarga.monto;
    }

    if (Object.keys(userUpdates).length > 0) {
      await updateUser(user.id, userUpdates);
    }

    if (recarga.modo === 'Compra VIP') {
      // Sistema de Comisiones Multi-nivel (A: 15%, B: 5%, C: 2%)
      // Solo se aplica si es Compra VIP y se aprueba por el admin
      let currentInviterId = user.invitado_por;
      const levelsCommissions = [0.15, 0.05, 0.02];

      for (let i = 0; i < levelsCommissions.length; i++) {
        if (!currentInviterId) break;
        const inviter = await findUserById(currentInviterId);
        if (!inviter) break;

        const commissionAmount = recarga.monto * levelsCommissions[i];
        await updateUser(inviter.id, {
          saldo_comisiones: (inviter.saldo_comisiones || 0) + commissionAmount
        });

        currentInviterId = inviter.invitado_por;
      }
    }
  }

  res.json({ ok: true });
});

router.post('/recargas/:id/rechazar', async (req, res) => {
  const { id } = req.params;
  const updates = {
    estado: 'rechazada',
    procesado_at: new Date().toISOString(),
    admin_notas: req.body.motivo || ''
  };

  if (req.user && req.user.id) {
    const adminExists = await findUserById(req.user.id);
    if (adminExists) updates.procesado_por = req.user.id;
  }

  await updateRecarga(id, updates);
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
    procesado_at: new Date().toISOString()
  };

  if (req.user && req.user.id) {
    const adminExists = await findUserById(req.user.id);
    if (adminExists) updates.procesado_por = req.user.id;
  }

  await updateRetiro(id, updates);
  res.json({ ok: true });
});

router.post('/retiros/:id/rechazar', async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  const retiro = await getRetiroById(id);
  if (!retiro) return res.status(404).json({ error: 'Retiro no encontrado en el sistema' });

  const updates = {
    estado: 'rechazado',
    procesado_at: new Date().toISOString(),
    admin_notas: motivo || ''
  };

  if (req.user && req.user.id) {
    const adminExists = await findUserById(req.user.id);
    if (adminExists) updates.procesado_por = req.user.id;
  }
  
  await updateRetiro(id, updates);
  
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
  
  const { data, fallback } = await trySupabase(() => supabase.from('tareas').insert([tarea]).select().maybeSingle());
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

  const { data, fallback } = await trySupabase(() => supabase.from('tareas').update(updates).eq('id', req.params.id).select().maybeSingle());
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

  const { data, fallback } = await trySupabase(() => supabase.from('metodos_qr').insert([metodo]).select().maybeSingle());
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
  const { imagen_url, imagen_base64, orden } = req.body;
  const banner = {
    id: uuidv4(),
    imagen_url: imagen_base64 || imagen_url || '',
    imagen_base64: imagen_base64 || null,
    orden: parseInt(orden) || 0,
    activo: true,
    created_at: new Date().toISOString()
  };

  const { data, fallback } = await trySupabase(() => supabase.from('banners_carrusel').insert([banner]).select().maybeSingle());
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

router.get('/niveles', async (req, res) => {
  const niveles = await getLevels();
  res.json(niveles);
});

router.put('/niveles/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const { data, fallback } = await trySupabase(() => 
    supabase.from('niveles').update(updates).eq('id', id).select().maybeSingle()
  );
  
  if (!fallback) return res.json(data);
  
  // Fallback para memoria local si no hay Supabase
  const store = await getStore();
  const nivel = (store.levels || []).find(n => n.id === id);
  if (nivel) Object.assign(nivel, updates);
  res.json(nivel || { error: 'Nivel no encontrado' });
});

router.get('/public-content', async (req, res) => {
  const config = await getPublicContent();
  res.json(config);
});

router.put('/public-content', async (req, res) => {
  const updates = req.body;
  const store = await getStore();
  
  // Guardar en Supabase (tabla configuraciones clave-valor)
  for (const [clave, valor] of Object.entries(updates)) {
    await trySupabase(() => 
      supabase.from('configuraciones').upsert({ clave, valor }, { onConflict: 'clave' })
    );
  }
  
  // Guardar en memoria local
  if (!store.publicContent) store.publicContent = {};
  Object.assign(store.publicContent, updates);
  
  res.json(store.publicContent);
});

export default router;
