import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPremiosRuleta, getSorteosGanadores, createSorteoGanador, findUserById, updateUser, getPremiosRuletaEspecial, getSorteosGanadoresEspecial, createSorteoGanadorEspecial } from '../lib/queries.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function pickByProbability(premios) {
  const activos = premios.filter(p => p.activo !== false);
  if (activos.length === 0) return null;

  const totalProb = activos.reduce((s, p) => s + (parseFloat(p.probabilidad) || 0), 0);
  
  // Si no hay probabilidades configuradas o son 0, elegir uno al azar equitativo
  if (totalProb <= 0) {
    return activos[Math.floor(Math.random() * activos.length)];
  }

  let r = Math.random() * totalProb;
  for (const p of activos) {
    const prob = parseFloat(p.probabilidad) || 0;
    r -= prob;
    if (r <= 0) return p;
  }
  return activos[activos.length - 1];
}

router.get('/premios', async (req, res) => {
  const premios = await getPremiosRuleta();
  res.json(premios);
});

router.get('/historial', async (req, res) => {
  const raw = await getSorteosGanadores();
  const historial = raw.map((h) => {
    // La relación en queries.js es 'usuario' (singular)
    const telefono = h.usuario?.telefono || '';
    const masked = telefono ? '****' + telefono.slice(-4) : '****' + Math.floor(1000 + Math.random() * 9000);
    return { ...h, usuario_masked: masked };
  });
  res.json(historial);
});

router.get('/oportunidades', authenticate, async (req, res) => {
  const user = await findUserById(req.user.id);
  res.json({ oportunidades: user?.oportunidades_sorteo ?? 0 });
});

router.post('/girar', authenticate, async (req, res) => {
  const user = await findUserById(req.user.id);
  const ops = user?.oportunidades_sorteo ?? 0;
  if (ops <= 0) return res.status(400).json({ error: 'No tienes oportunidades de sorteo' });
  const premios = await getPremiosRuleta();
  if (premios.length === 0) return res.status(400).json({ error: 'No hay premios configurados' });
  
  const premio = pickByProbability(premios);
  const nuevasOps = Math.max(0, ops - 1);
  
  // Actualizar saldo de comisiones primero (columna garantizada)
  await updateUser(user.id, { 
    saldo_comisiones: (user.saldo_comisiones || 0) + (premio.valor || 0)
  });

  // Intentar actualizar las oportunidades de sorteo (columna opcional en Supabase)
  try {
    await updateUser(user.id, { oportunidades_sorteo: nuevasOps });
  } catch (err) {
    console.warn('[Raffle] Error al actualizar oportunidades_sorteo:', err.message);
  }
  
  const ganador = {
    id: uuidv4(),
    usuario_id: req.user.id,
    premio_id: premio.id,
    monto: premio.valor,
    created_at: new Date().toISOString(),
  };
  await createSorteoGanador(ganador);
  
  const idx = premios.findIndex(p => p.id === premio.id);
  res.json({ 
    premio: { ...premio, premio_nombre: premio.nombre, premio_valor: premio.valor }, 
    indice: idx, 
    ganador, 
    oportunidades_restantes: nuevasOps 
  });
});

// --- RUTAS PARA RULETA ESPECIAL ---

router.get('/premios-especial', async (req, res) => {
  const premios = await getPremiosRuletaEspecial();
  res.json(premios);
});

router.get('/historial-especial', async (req, res) => {
  const raw = await getSorteosGanadoresEspecial();
  const historial = raw.map((h) => {
    const telefono = h.usuario?.telefono || '';
    const masked = telefono ? '****' + telefono.slice(-4) : '****' + Math.floor(1000 + Math.random() * 9000);
    return { ...h, usuario_masked: masked };
  });
  res.json(historial);
});

router.get('/oportunidades-especial', authenticate, async (req, res) => {
  const user = await findUserById(req.user.id);
  res.json({ oportunidades: user?.oportunidades_sorteo_especial ?? 0 });
});

router.post('/girar-especial', authenticate, async (req, res) => {
  const user = await findUserById(req.user.id);
  const ops = user?.oportunidades_sorteo_especial ?? 0;
  if (ops <= 0) return res.status(400).json({ error: 'No tienes oportunidades de sorteo especial' });
  const premios = await getPremiosRuletaEspecial();
  if (premios.length === 0) return res.status(400).json({ error: 'No hay premios configurados' });
  
  const premio = pickByProbability(premios);
  const nuevasOps = Math.max(0, ops - 1);
  
  await updateUser(user.id, { 
    saldo_comisiones: (user.saldo_comisiones || 0) + (premio.valor || 0),
    oportunidades_sorteo_especial: nuevasOps
  });
  
  const ganador = {
    id: uuidv4(),
    usuario_id: req.user.id,
    premio_id: premio.id,
    monto: premio.valor,
    created_at: new Date().toISOString(),
  };
  await createSorteoGanadorEspecial(ganador);
  
  const idx = premios.findIndex(p => p.id === premio.id);
  res.json({ 
    premio: { ...premio, premio_nombre: premio.nombre, premio_valor: premio.valor }, 
    indice: idx, 
    ganador, 
    oportunidades_restantes: nuevasOps 
  });
});

export default router;
