import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import { getPremiosRuleta, createSorteoGanador, findUserById, updateUser, getSorteosGanadores } from '../lib/queries.js';

const router = Router();

router.get('/config', async (req, res) => {
  try {
    const { getPublicContent } = await import('../lib/queries.js');
    const config = await getPublicContent();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener config' });
  }
});

router.get('/premios', async (req, res) => {
  try {
    const premios = await getPremiosRuleta();
    res.json(premios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener premios' });
  }
});

router.get('/historial', async (req, res) => {
  try {
    const historial = await getSorteosGanadores();
    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

router.post('/girar', authenticate, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Verificar si tiene saldo suficiente o intentos (puedes ajustar esta lógica)
    // Por ahora, usaremos un costo de 10 BOB del saldo de comisiones o principal
    const costo = 5; 
    if ((user.saldo_comisiones || 0) < costo && (user.saldo_principal || 0) < costo) {
      return res.status(400).json({ error: 'Saldo insuficiente para girar (Costo: 5 BOB)' });
    }

    const premios = await getPremiosRuleta();
    if (premios.length === 0) return res.status(400).json({ error: 'No hay premios configurados' });

    // Lógica de probabilidad
    const totalProb = premios.reduce((acc, p) => acc + (Number(p.probabilidad) || 0), 0);
    let random = Math.random() * totalProb;
    let premioGanado = premios[0];

    for (const p of premios) {
      if (random < (Number(p.probabilidad) || 0)) {
        premioGanado = p;
        break;
      }
      random -= (Number(p.probabilidad) || 0);
    }

    // Descontar saldo y otorgar premio
    const updates = {};
    if ((user.saldo_comisiones || 0) >= costo) {
      updates.saldo_comisiones = (user.saldo_comisiones || 0) - costo + (Number(premioGanado.valor) || 0);
    } else {
      updates.saldo_principal = (user.saldo_principal || 0) - costo + (Number(premioGanado.valor) || 0);
    }

    await updateUser(user.id, updates);

    // Registrar ganador
    const registro = {
      id: uuidv4(),
      usuario_id: user.id,
      premio_id: premioGanado.id,
      monto: premioGanado.valor,
      created_at: new Date().toISOString()
    };
    await createSorteoGanador(registro);

    res.json({
      ok: true,
      premio: premioGanado,
      nuevo_saldo_comisiones: updates.saldo_comisiones,
      nuevo_saldo_principal: updates.saldo_principal
    });

  } catch (err) {
    console.error('[Sorteo] Error al girar:', err);
    res.status(500).json({ error: 'Error al procesar el sorteo' });
  }
});

export default router;
