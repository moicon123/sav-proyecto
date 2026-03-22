import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { findUserById, getLevels, getTasks, getTaskById, getTaskActivity, createTaskActivity, updateUser } from '../lib/queries.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
  const levels = await getLevels();
  const level = levels.find(l => l.id === user.nivel_id) || levels[0];
  const allTasks = await getTasks(user.nivel_id);
  const activity = await getTaskActivity(user.id);
  
  const today = new Date().toDateString();
  const todayCompletedActivity = activity.filter(a => 
    new Date(a.created_at).toDateString() === today && a.respuesta_correcta === true
  );
  
  // Logic for Pasante (l1): 3 days limit
  if (level.id === 'l1') {
    const uniqueDays = new Set(activity.filter(a => a.respuesta_correcta === true).map(a => new Date(a.created_at).toDateString()));
    // If they have already worked 3 days and today is not one of them, or if they worked 3 days including today and finished
    if (uniqueDays.size >= 3 && !uniqueDays.has(today)) {
      return res.json({
        nivel: level.nombre,
        nivel_id: level.id,
        tareas_restantes: 0,
        tareas_completadas: todayCompletedActivity.length,
        tareas: [],
        mensaje: 'Has completado tus 3 días de prueba como pasante. Por favor sube de nivel para continuar.'
      });
    }
  }

  const completedTaskIdsToday = new Set(todayCompletedActivity.map(a => a.tarea_id));
  
  // Filter out tasks already completed successfully today so they "disappear"
  const availableTasks = allTasks.filter(t => !completedTaskIdsToday.has(t.id));
  
  const remaining = Math.max(0, level.num_tareas_diarias - todayCompletedActivity.length);
  
  // Limit the number of available tasks shown to the remaining count for the day
  const tasksToShow = availableTasks.slice(0, remaining);

  res.json({
    nivel: level.nombre,
    nivel_id: level.id,
    tareas_restantes: remaining,
    tareas_completadas: todayCompletedActivity.length,
    tareas: tasksToShow.map(t => ({
      id: t.id,
      nombre: t.nombre,
      nivel: level.nombre,
      recompensa: t.recompensa,
      video_url: t.video_url,
      imagen_url: t.video_url,
    })),
  });
});

router.get('/:id', authenticate, async (req, res) => {
  const task = await getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  const levels = await getLevels();
  const level = levels.find(l => l.id === task.nivel_id);
  res.json({
    ...task,
    nivel: level?.nombre,
  });
});

router.post('/:id/responder', authenticate, async (req, res) => {
  const { respuesta } = req.body;
  const user = await findUserById(req.user.id);
  const task = await getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  
  const levels = await getLevels();
  const level = levels.find(l => l.id === user.nivel_id) || levels[0];
  const activity = await getTaskActivity(user.id);
  const today = new Date().toDateString();

  // Logic for Pasante (l1): 3 days limit
  if (level.id === 'l1') {
    const uniqueDays = new Set(activity.map(a => new Date(a.created_at).toDateString()));
    if (uniqueDays.size >= 3 && !uniqueDays.has(today)) {
      return res.status(400).json({ error: 'Has completado tus 3 días de prueba como pasante. Por favor sube de nivel para continuar.' });
    }
  }
  
  const yaCompletadaExitosamente = activity.some(
    a => a.tarea_id === task.id && new Date(a.created_at).toDateString() === today && a.respuesta_correcta === true
  );
  if (yaCompletadaExitosamente) return res.status(400).json({ error: 'Ya completaste esta tarea con éxito hoy' });

  const correcta = (respuesta || '').toUpperCase().trim() === (task.respuesta_correcta || '').toUpperCase().trim();
  const recompensa = correcta ? task.recompensa : 0;
  if (recompensa) {
    // Actualizar saldo de tareas del usuario
    const updates = {
      saldo_principal: (user.saldo_principal || 0) + recompensa,
    };
    await updateUser(user.id, updates);
  }

  await createTaskActivity({
    id: uuidv4(),
    usuario_id: user.id,
    tarea_id: task.id,
    respuesta_correcta: correcta,
    recompensa_otorgada: recompensa,
    created_at: new Date().toISOString(),
  });

  res.json({ correcta, recompensa });
});

export default router;
