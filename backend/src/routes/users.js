import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { findUserById, getLevels, updateUser, getTaskActivity, getTarjetasByUser } from '../lib/queries.js';
import { authenticate } from '../middleware/auth.js';
import { getStore } from '../data/store.js';
import { supabase } from '../lib/db.js';

const router = Router();

function sanitizeUser(u, levels) {
  const level = levels.find(l => l.id === u.nivel_id);
  return {
    id: u.id,
    telefono: u.telefono,
    nombre_usuario: u.nombre_usuario,
    nombre_real: u.nombre_real,
    codigo_invitacion: u.codigo_invitacion,
    nivel: level?.nombre || 'pasante',
    nivel_id: u.nivel_id,
    nivel_codigo: level?.codigo || 'internar',
    saldo_principal: u.saldo_principal || 0,
    saldo_comisiones: u.saldo_comisiones || 0,
    rol: u.rol,
    avatar_url: u.avatar_url,
    oportunidades_sorteo: u.oportunidades_sorteo ?? 0,
    tiene_password_fondo: !!u.password_fondo_hash,
  };
}

router.get('/me', authenticate, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const levels = await getLevels();
  res.json(sanitizeUser(user, levels));
});

router.put('/me', authenticate, async (req, res) => {
  const { nombre_real } = req.body;
  const updates = {};
  if (nombre_real !== undefined) updates.nombre_real = nombre_real;
  
  const user = await updateUser(req.user.id, updates);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const levels = await getLevels();
  res.json(sanitizeUser(user, levels));
});

router.post('/change-password', authenticate, async (req, res) => {
  const { password_actual, password_nueva } = req.body;
  if (!password_actual || !password_nueva) {
    return res.status(400).json({ error: 'Indica la contraseña actual y la nueva' });
  }
  if (String(password_nueva).length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const ok = await bcrypt.compare(password_actual, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
  
  const password_hash = await bcrypt.hash(password_nueva, 10);
  await updateUser(user.id, { password_hash });
  res.json({ ok: true });
});

router.post('/change-fund-password', authenticate, async (req, res) => {
  const { password_actual, password_nueva } = req.body;
  if (!password_nueva || String(password_nueva).length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña del fondo debe tener al menos 6 caracteres' });
  }
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.password_fondo_hash) {
    if (!password_actual) {
      return res.status(400).json({ error: 'Debes indicar la contraseña actual del fondo' });
    }
    const ok = await bcrypt.compare(password_actual, user.password_fondo_hash);
    if (!ok) return res.status(400).json({ error: 'Contraseña del fondo incorrecta' });
  }
  
  const password_fondo_hash = await bcrypt.hash(password_nueva, 10);
  await updateUser(user.id, { password_fondo_hash });
  res.json({ ok: true });
});

router.get('/stats', authenticate, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const activity = await getTaskActivity(user.id);
  
  // Calcular ingresos reales basados en la actividad de tareas
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filterByDate = (list, start, end = null) => {
    return list.filter(item => {
      const d = new Date(item.created_at);
      if (end) return d >= start && d < end;
      return d >= start;
    });
  };

  const sumMonto = (list) => list.reduce((s, i) => s + (i.recompensa || 0), 0);

  const hoy = filterByDate(activity, startOfToday);
  const ayer = filterByDate(activity, startOfYesterday, startOfToday);
  const semana = filterByDate(activity, startOfWeek);
  const mes = filterByDate(activity, startOfMonth);

  // Verificar límite de pasante
  const uniqueDays = new Set(activity.filter(a => a.recompensa_otorgada > 0).map(a => new Date(a.created_at).toDateString()));
  const isPasante = user.nivel_id === 'l1';
  const limitReached = isPasante && uniqueDays.size >= 3 && !uniqueDays.has(new Date().toDateString());

  res.json({
    ingresos_ayer: sumMonto(ayer),
    ingresos_hoy: sumMonto(hoy),
    ingresos_semana: sumMonto(semana),
    ingresos_mes: sumMonto(mes),
    ingresos_totales: sumMonto(activity),
    comision_subordinados: user.saldo_comisiones || 0,
    recompensa_invitacion: user.recompensa_invitacion || 0,
    total_completadas: activity.length,
    pasante_limit_reached: limitReached,
  });
});
  });
});

router.get('/tarjetas', authenticate, async (req, res) => {
  const tarjetas = await getTarjetasByUser(req.user.id);
  res.json(tarjetas);
});

router.post('/tarjetas', authenticate, async (req, res) => {
  const { nombre_banco, tipo, numero_cuenta } = req.body;
  const nombre = String(nombre_banco || '').trim();
  if (!nombre || numero_cuenta === undefined || numero_cuenta === '') {
    return res.status(400).json({ error: 'Indica banco y número de cuenta' });
  }
  const digits = String(numero_cuenta).replace(/\D/g, '');
  const last4 = digits.slice(-4);
  if (last4.length < 4) {
    return res.status(400).json({ error: 'Ingresa al menos 4 dígitos del número de cuenta' });
  }
  
  const tarjeta = {
    id: uuidv4(),
    usuario_id: req.user.id,
    tipo: String(tipo || 'banco').trim() || 'banco',
    nombre_banco: nombre,
    numero_masked: last4,
  };
  
  const store = await getStore();
  if (store.tarjetas) {
    store.tarjetas.push(tarjeta);
  } else {
    // If Supabase is connected, we should insert there
    await supabase.from('tarjetas_bancarias').insert([tarjeta]);
  }
  
  res.json({
    id: tarjeta.id,
    tipo: tarjeta.tipo,
    numero_masked: tarjeta.numero_masked,
    nombre_banco: tarjeta.nombre_banco,
  });
});

router.delete('/tarjetas/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  await supabase.from('tarjetas_bancarias').delete().eq('id', id).eq('usuario_id', req.user.id);
  // Also handle local store if needed, but let's prioritize Supabase
  res.json({ ok: true });
});

router.get('/notificaciones', authenticate, async (req, res) => {
  const { data } = await supabase.from('notificaciones').select('*').eq('usuario_id', req.user.id).order('created_at', { ascending: false }).limit(20);
  res.json(data || []);
});

router.put('/notificaciones/:id/read', authenticate, async (req, res) => {
  await supabase.from('notificaciones').update({ leida: true }).eq('id', req.params.id).eq('usuario_id', req.user.id);
  res.json({ ok: true });
});

router.get('/team', authenticate, async (req, res) => {
  const root = await findUserById(req.user.id);
  if (!root) return res.status(404).json({ error: 'Usuario no encontrado' });

  // This part is complex for Supabase without a recursive query, 
  // let's keep it simple for now or use the store if possible
  const store = await getStore();
  const allUsers = store.users || [];
  
  const byInviter = new Map();
  for (const u of allUsers.filter(u => u.rol === 'usuario')) {
    if (!byInviter.has(u.invitado_por || 'root')) byInviter.set(u.invitado_por || 'root', []);
    byInviter.get(u.invitado_por || 'root').push(u);
  }

  const buildNode = (user, depth = 0) => {
    const children = (byInviter.get(user.id) || []).map((c) => buildNode(c, depth + 1));
    return {
      id: user.id,
      nombre: user.nombre_usuario,
      codigo_invitacion: user.codigo_invitacion,
      telefono: user.telefono,
      nivel_red: depth === 0 ? 'TU' : depth === 1 ? 'A' : depth === 2 ? 'B' : 'C',
      porcentaje_comision: depth === 1 ? 20 : depth === 2 ? 10 : depth >= 3 ? 5 : 0,
      saldo_principal: user.saldo_principal || 0,
      children,
    };
  };

  const tree = buildNode(root, 0);

  const descendants = [];
  const walk = (node, depth = 0) => {
    if (depth > 0) descendants.push(node);
    node.children.forEach((c) => walk(c, depth + 1));
  };
  walk(tree);

  const group = (level) => descendants.filter((n) => n.nivel_red === level);
  const groupStats = (level) => {
    const arr = group(level);
    return {
      nivel: level,
      total_miembros: arr.length,
      monto_recarga: arr.reduce((s, x) => s + (x.saldo_principal || 0), 0),
      porcentaje: level === 'A' ? 20 : level === 'B' ? 10 : 5,
    };
  };

  const totalIngresos = descendants.reduce((s, d) => s + (d.saldo_principal || 0), 0);
  const hoyIngresos = descendants.slice(0, 2).reduce((s, d) => s + (d.saldo_principal || 0), 0);

  res.json({
    resumen: {
      ingresos_totales: totalIngresos,
      ingresos_hoy: hoyIngresos,
      total_miembros: descendants.length,
      nuevos_miembros: group('A').length,
    },
    analisis: {
      tarea: Number((totalIngresos * 0.25).toFixed(2)),
      invitacion: Number((totalIngresos * 0.65).toFixed(2)),
      inversion: Number((totalIngresos * 0.1).toFixed(2)),
    },
    niveles: [groupStats('A'), groupStats('B'), groupStats('C')],
    tree,
  });
});

export default router;
