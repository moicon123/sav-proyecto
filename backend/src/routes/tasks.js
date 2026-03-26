import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { findUserById, getLevels, getTasks, getTaskActivity, createTaskActivity, updateUser, distributeCommissions } from '../lib/queries.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    // Restricción de fin de semana (Sábado = 6, Domingo = 0)
    const now = new Date();
    const day = now.getDay();
    if (day === 0 || day === 6) {
      return res.status(403).json({ 
        error: 'Las tareas solo están disponibles de lunes a viernes.',
        es_fin_de_semana: true 
      });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      console.warn(`[Tasks] Usuario con ID ${req.user.id} no encontrado en la base de datos.`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const levels = await getLevels();
    const level = levels.find(l => String(l.id) === String(user.nivel_id)) || levels[0];
    
    console.log(`[Tasks] Usuario: ${user.nombre_usuario}, Nivel ID del usuario: "${user.nivel_id}", Buscando nivel: "${level.nombre}"`);

    const allTasks = await getTasks(level.id);
    const activity = await getTaskActivity(user.id);
    
    console.log(`[Tasks] Nivel: ${level.nombre} (Activo: ${level.activo}), Tareas encontradas: ${allTasks.length}, Actividad total: ${activity.length}`);
  
    if (level.activo === false) {
      return res.json({
        nivel: level.nombre,
        nivel_id: level.id,
        tareas_restantes: 0,
        tareas_completadas: 0,
        tareas: [],
        mensaje: 'Este nivel está bloqueado temporalmente por el administrador. Contacta con soporte para más información.'
      });
    }

    // Helper para comparar fechas en la zona horaria de Bolivia (UTC-4)
    const getBoliviaDateString = (date) => {
      return new Date(date).toLocaleDateString('en-US', { timeZone: 'America/La_Paz' });
    };

    const todayStr = getBoliviaDateString(new Date());
    const todayCompletedActivity = activity.filter(a => 
      getBoliviaDateString(a.created_at) === todayStr && a.respuesta_correcta === true
    );
  
  // Logic for Pasante (l1): 3 days limit
  const isPasante = String(level.id) === 'l1' || String(level.codigo) === 'pasante' || String(level.codigo) === 'internar';
  
  if (isPasante) {
    const successfulActivities = activity.filter(a => a.respuesta_correcta === true);
    const uniqueDays = new Set(successfulActivities.map(a => getBoliviaDateString(a.created_at)));
    // If they have already worked 3 days and today is not one of them, or if they worked 3 days including today and finished
    if (uniqueDays.size >= 3 && !uniqueDays.has(todayStr)) {
      console.log(`[Tasks] Límite de 3 días alcanzado para pasante: ${user.nombre_usuario}`);
      return res.json({
        nivel: level.nombre,
        nivel_id: level.id,
        tareas_restantes: 0,
        tareas_completadas: todayCompletedActivity.length,
        tareas: [],
        mensaje: '¡Atención! Tus 3 días de prueba como pasante han terminado. Sube de nivel ahora para seguir ganando recompensas diarias.'
      });
    }
  }

    // Filter out tasks already completed successfully today so they "disappear"
    const completedTaskIdsToday = new Set(todayCompletedActivity.map(a => String(a.tarea_id)));
    
    // Filtro mejorado para asegurar que desaparezcan incluso con IDs diferentes (uuid vs string)
    const availableTasks = allTasks.filter(t => !completedTaskIdsToday.has(String(t.id)));
    
    // CORRECCIÓN: Usar tareas_diarias en lugar de num_tareas_diarias (coincide con esquema real)
    const numTareasDiarias = Number(level.tareas_diarias) || 0;
    const remaining = Math.max(0, numTareasDiarias - todayCompletedActivity.length);
    
    console.log(`[Tasks] Diarias: ${numTareasDiarias}, Completadas: ${todayCompletedActivity.length}, Restantes: ${remaining}, Disponibles: ${availableTasks.length}`);
     
     let mensaje = null;
     if (remaining <= 0 && numTareasDiarias > 0) {
       mensaje = '¡Felicidades! Has completado todas tus tareas de hoy. Vuelve mañana para seguir ganando.';
     } else if (availableTasks.length === 0) {
       mensaje = 'No hay más videos disponibles para tu nivel en este momento. Por favor, contacta al administrador.';
     }

     res.json({
       nivel: level.nombre,
       nivel_id: level.id,
       tareas_restantes: remaining,
       tareas_completadas: todayCompletedActivity.length,
       tareas: availableTasks.map(t => ({
         id: t.id,
         nombre: t.nombre,
         nivel: level.nombre,
         recompensa: t.recompensa,
         video_url: t.video_url,
         imagen_url: t.video_url,
         descripcion: t.descripcion,
       })),
       mensaje
     });
  } catch (err) {
    console.error('[Tasks] Error crítico cargando sala de tareas:', err);
    res.status(500).json({ error: 'Error interno al cargar las tareas' });
  }
});

export default router;
