import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { findUserById, getLevels, getTasks, getTaskById, getTaskActivity, createTaskActivity, updateUser, distributeCommissions } from '../lib/queries.js';
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

router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    
    const levels = await getLevels();
    const level = levels.find(l => String(l.id) === String(task.nivel_id));
    
    const activity = await getTaskActivity(req.user.id);
    
    // Helper para comparar fechas en la zona horaria de Bolivia (UTC-4)
    const getBoliviaDateString = (date) => {
      return new Date(date).toLocaleDateString('en-US', { timeZone: 'America/La_Paz' });
    };
    
    const todayStr = getBoliviaDateString(new Date());
    const yaCompletadaExitosamente = activity.some(
      a => String(a.tarea_id) === String(task.id) && 
           getBoliviaDateString(a.created_at) === todayStr && 
           a.respuesta_correcta === true
    );

    res.json({
      ...task,
      nivel: level?.nombre,
      completada_hoy: yaCompletadaExitosamente,
    });
  } catch (err) {
    console.error(`[Tasks] Error en GET /api/tasks/${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Error al cargar detalles de la tarea' });
  }
});

router.post('/:id/responder', authenticate, async (req, res) => {
  try {
    const { respuesta } = req.body;
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const task = await getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    console.log(`[Tasks] Respuesta recibida de ${user.nombre_usuario} para tarea ${req.params.id}: "${respuesta}"`);

    const levels = await getLevels();
    const level = levels.find(l => String(l.id) === String(user.nivel_id)) || levels[0];
    const activity = await getTaskActivity(user.id);
    
    // Helper para comparar fechas en la zona horaria de Bolivia (UTC-4)
    const getBoliviaDateString = (date) => {
      return new Date(date).toLocaleDateString('en-US', { timeZone: 'America/La_Paz' });
    };
    
    const todayStr = getBoliviaDateString(new Date());

    // Logic for Pasante (l1): 3 days limit
    if (String(level.id) === 'l1' || String(level.codigo) === 'pasante') {
      const successfulActivities = activity.filter(a => a.respuesta_correcta === true);
      const uniqueDays = new Set(successfulActivities.map(a => getBoliviaDateString(a.created_at)));
      if (uniqueDays.size >= 3 && !uniqueDays.has(todayStr)) {
        console.log(`[Tasks] Bloqueado: Pasante ${user.nombre_usuario} agotó sus 3 días.`);
        return res.status(400).json({ error: 'Tus 3 días de prueba han terminado. Sube de nivel.' });
      }
    }
    
    const yaCompletadaExitosamente = activity.some(
      a => String(a.tarea_id) === String(task.id) && 
           getBoliviaDateString(a.created_at) === todayStr && 
           a.respuesta_correcta === true
    );
    
    if (yaCompletadaExitosamente) {
      return res.status(400).json({ error: 'Ya completaste esta tarea con éxito hoy' });
    }

    // Normalización robusta: eliminar acentos, convertir a mayúsculas y limpiar espacios
    const normalizar = (str) => {
      if (!str) return '';
      return String(str)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .toUpperCase()
        .trim();
    };

    const respuestaLimpia = normalizar(respuesta);
    // Aceptamos tanto respuesta_correcta como pregunta_real por compatibilidad con diferentes esquemas
    const correctaReal = task.respuesta_correcta || task.pregunta_real || '';
    const correctaLimpia = normalizar(correctaReal);
    
    console.log(`[Tasks] Validando Tarea: ${task.id}`);
    console.log(`[Tasks] Respuesta Usuario: "${respuesta}" -> "${respuestaLimpia}"`);
    console.log(`[Tasks] Respuesta Correcta: "${correctaReal}" -> "${correctaLimpia}"`);
    
    // Comparación robusta: coincidencia exacta después de normalizar espacios
    // Eliminamos todos los espacios solo para la comparación final para evitar errores de tipeo
    const sinEspacios = (s) => s.replace(/\s+/g, '');
    const esCorrectaReal = respuestaLimpia !== '' && correctaLimpia !== '' && (
      sinEspacios(respuestaLimpia) === sinEspacios(correctaLimpia)
    );
    
    console.log(`[Tasks] Resultado Validación: ${esCorrectaReal ? 'CORRECTA ✅' : 'INCORRECTA ❌'}`);
    
    const recompensa = esCorrectaReal ? task.recompensa : 0;
    
    if (esCorrectaReal) {
      await updateUser(user.id, {
        saldo_principal: (Number(user.saldo_principal) || 0) + Number(recompensa),
      });
      
      // Registrar en estadísticas persistentes del usuario
      const { addUserEarnings, distributeCommissions } = await import('../lib/queries.js');
      await addUserEarnings(user.id, Number(recompensa));
      
      // Distribuir comisiones a la red (A, B, C)
      await distributeCommissions(user.id, recompensa);
    }

    await createTaskActivity({
      id: uuidv4(),
      usuario_id: user.id,
      tarea_id: task.id,
      respuesta_correcta: esCorrectaReal,
      recompensa_otorgada: recompensa,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      correcta: esCorrectaReal,
      monto: esCorrectaReal ? recompensa : 0,
      mensaje: esCorrectaReal ? '¡Tarea completada con éxito!' : 'Respuesta incorrecta, inténtalo de nuevo.',
    });
  } catch (err) {
    console.error(`[Tasks] Error en POST /api/tasks/${req.params.id}/responder:`, err.message);
    res.status(500).json({ error: 'Error al procesar la respuesta de la tarea' });
  }
});

export default router;
