import { supabase, hasDb } from './db.js';
import { getStore } from '../data/store.js';
import { levels as seedLevels } from '../data/seed.js';

export async function trySupabase(operation) {
  try {
    if (hasDb()) {
      const { data, error } = await operation();
      if (error) {
        console.warn('[Supabase] Error en la operación:', error.message);
        return { data: null, error, fallback: true };
      }
      return { data, error: null, fallback: false };
    }
    console.warn('[Supabase] No hay conexión a la base de datos (SUPABASE_URL/KEY faltante)');
  } catch (err) {
    console.error('[Supabase] Error crítico de conexión:', err.message);
    return { data: null, error: err, fallback: true };
  }
  return { data: null, error: new Error('No DB connection'), fallback: true };
}

export async function getUsers() {
  const { data, fallback } = await trySupabase(() => supabase.from('usuarios').select('*'));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return store.users;
}

export async function findUserByTelefono(telefono) {
  const { data, fallback } = await trySupabase(() => supabase.from('usuarios').select('*').eq('telefono', telefono).maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  return store.users.find(u => u.telefono === telefono);
}

export async function findUserById(id) {
  const { data, fallback } = await trySupabase(() => supabase.from('usuarios').select('*').eq('id', id).maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  const user = store.users.find(u => String(u.id) === String(id));
  if (user) console.log(`[Queries] findUserById encontrado en store local: ${user.nombre_usuario} (${id})`);
  return user;
}

export async function findUserByCodigo(codigo) {
  const { data, fallback } = await trySupabase(() => supabase.from('usuarios').select('*').eq('codigo_invitacion', codigo).maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  return store.users.find(u => u.codigo_invitacion === codigo);
}

export async function createUser(userData) {
  console.log(`[Queries] Intentando crear usuario: ${userData.nombre_usuario} (${userData.telefono})`);
  const { data, error, fallback } = await trySupabase(() => supabase.from('usuarios').insert([userData]).select().maybeSingle());
  
  if (!fallback) {
    if (error) {
      console.error('[Queries] Error crítico al insertar en Supabase:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    }
    console.log(`[Queries] Usuario creado exitosamente en Supabase: ${userData.nombre_usuario}`);
    return data;
  }
  
  console.warn('[Queries] Fallback activado: Guardando usuario en memoria local (NO PERSISTENTE)');
  const store = await getStore();
  store.users.push(userData);
  return userData;
}

export async function updateUser(id, updates) {
  const { data, fallback } = await trySupabase(() => supabase.from('usuarios').update(updates).eq('id', id).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  const user = store.users.find(u => u.id === id);
  if (user) Object.assign(user, updates);
  return user;
}

export async function getLevels() {
  const { data, fallback } = await trySupabase(() => supabase.from('niveles').select('*').order('orden', { ascending: true }));
  
  // Si tenemos datos de la DB, los mapeamos con el estado de bloqueo manual
  if (!fallback && data && data.length > 0) {
    return data.map(dbLevel => {
      const seedLevel = seedLevels.find(s => s.codigo === dbLevel.codigo);
      return {
        ...dbLevel,
        // Si el nivel está marcado como inactivo en el código (S4+), forzar bloqueo
        activo: seedLevel ? (seedLevel.activo !== false) : (dbLevel.activo !== false)
      };
    });
  }
  
  console.log('[Queries] getLevels fallback to seedLevels');
  return seedLevels;
}

export async function getRecargas() {
  const { data, fallback } = await trySupabase(() => supabase.from('recargas').select('*, usuario:usuarios!usuario_id(nombre_usuario)').order('created_at', { ascending: false }));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return store.recargas || [];
}

export async function getRecargaById(id) {
  const { data, fallback } = await trySupabase(() => supabase.from('recargas').select('*').eq('id', id).maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  return (store.recargas || []).find(r => r.id === id);
}

export async function getRetiros() {
  const { data, fallback } = await trySupabase(() => supabase.from('retiros').select('*, usuario:usuarios!usuario_id(nombre_usuario)').order('created_at', { ascending: false }));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return store.retiros || [];
}


export async function getMetodosQr() {
  const { data, fallback } = await trySupabase(() => supabase.from('metodos_qr').select('*').eq('activo', true).order('orden', { ascending: true }));
  // Si no hay error (fallback es falso), devolvemos data aunque sea una lista vacía []
  if (!fallback) return data || [];
  
  const store = await getStore();
  return (store.metodosQr || []).filter(m => m.activo).sort((a, b) => (a.orden || 0) - (b.orden || 0));
}

export async function getRecargasByUser(userId) {
  const { data, fallback } = await trySupabase(() => supabase.from('recargas').select('*').eq('usuario_id', userId).order('created_at', { ascending: false }));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return (store.recargas || []).filter(r => r.usuario_id === userId);
}

export async function createRecarga(recargaData) {
  const { data, fallback } = await trySupabase(() => supabase.from('recargas').insert([recargaData]).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  if (!store.recargas) store.recargas = [];
  store.recargas.push(recargaData);
  return recargaData;
}

export async function updateRecarga(id, updates) {
  const { data, fallback } = await trySupabase(() => supabase.from('recargas').update(updates).eq('id', id).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  const recarga = (store.recargas || []).find(r => r.id === id);
  if (recarga) Object.assign(recarga, updates);
  return recarga;
}

export async function getRetirosByUser(userId) {
  const { data, fallback } = await trySupabase(() => supabase.from('retiros').select('*').eq('usuario_id', userId).order('created_at', { ascending: false }));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return (store.retiros || []).filter(r => r.usuario_id === userId);
}

export async function createRetiro(retiroData) {
  const { data, fallback } = await trySupabase(() => supabase.from('retiros').insert([retiroData]).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  if (!store.retiros) store.retiros = [];
  store.retiros.push(retiroData);
  return retiroData;
}

export async function getRetiroById(id) {
  const { data, fallback } = await trySupabase(() => supabase.from('retiros').select('*').eq('id', id).maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  return (store.retiros || []).find(r => r.id === id);
}

export async function updateRetiro(id, updates) {
  const { data, fallback } = await trySupabase(() => supabase.from('retiros').update(updates).eq('id', id).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  const retiro = (store.retiros || []).find(r => r.id === id);
  if (retiro) Object.assign(retiro, updates);
  return retiro;
}

export async function getTarjetasByUser(userId) {
  const { data, fallback } = await trySupabase(() => supabase.from('tarjetas_bancarias').select('*').eq('usuario_id', userId));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return (store.tarjetas || []).filter(t => t.usuario_id === userId);
}

export async function getPublicContent() {
  const { data, fallback } = await trySupabase(() => supabase.from('configuraciones').select('*'));
  if (!fallback && data && data.length > 0) return data.reduce((acc, curr) => ({ ...acc, [curr.clave]: curr.valor }), {});
  const store = await getStore();
  return store.publicContent || {};
}

export async function getBanners() {
  const { data, fallback } = await trySupabase(() => supabase.from('banners_carrusel').select('*').eq('activo', true).order('orden', { ascending: true }));
  
  // Siempre incluir los banners por defecto de la carpeta /imag/
  const defaultBanners = [
    { id: 'def-1', imagen_url: '/imag/carrusel1.jpeg', titulo: 'SAV 1', orden: 0, activo: true },
    { id: 'def-2', imagen_url: '/imag/carrusel2.jpeg', titulo: 'SAV 2', orden: 1, activo: true },
    { id: 'def-3', imagen_url: '/imag/carrusel3.jpeg', titulo: 'SAV 3', orden: 2, activo: true },
    { id: 'def-4', imagen_url: '/imag/carrusel4.jpeg', titulo: 'SAV 4', orden: 3, activo: true },
  ];

  // Si Supabase responde correctamente (fallback: false)
  if (!fallback && data && data.length > 0) {
    // Si hay datos en la DB, combinamos o priorizamos los de la DB
    // Por ahora, devolvemos los de la DB pero corregimos URLs si es necesario
    return data.map(b => ({
      ...b,
      imagen_url: b.imagen_url === '/imag/carusel1.jpeg' ? '/imag/carrusel1.jpeg' : b.imagen_url
    }));
  }

  // Si no hay datos en la DB o Supabase falló, devolvemos siempre los de la carpeta /imag/
  return defaultBanners;
}

export async function getAllTasks() {
  const { data, fallback } = await trySupabase(() => supabase.from('tareas').select('*').order('created_at', { ascending: false }));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return store.tasks || [];
}

export async function getTasks(nivelId) {
  const { data, fallback } = await trySupabase(() => supabase.from('tareas').select('*').eq('nivel_id', nivelId).eq('activa', true));
  if (!fallback && data && data.length > 0) return data;
  
  const store = await getStore();
  const levels = await getLevels();
  // Intentar encontrar el nivel por ID, o si no, por código si el nivelId parece ser un UUID de Supabase
  const currentLevel = levels.find(l => String(l.id) === String(nivelId)) || 
                       levels.find(l => String(l.codigo) === 'pasante' && (nivelId === 'l1' || nivelId === 'pasante' || String(nivelId).length > 20));
  
  console.log(`[Queries] getTasks para: "${nivelId}". Nivel detectado: ${currentLevel?.nombre || 'Desconocido'}, Código: ${currentLevel?.codigo}`);

  // Lógica Ultra-Robusta para encontrar tareas locales
  const localTasks = (store.tasks || []).filter(t => {
    // Coincidencia por ID directo
    if (String(t.nivel_id) === String(nivelId)) return true;
    
    if (currentLevel) {
      // Coincidencia por ID del nivel encontrado
      if (String(t.nivel_id) === String(currentLevel.id)) return true;
      // Coincidencia por Código del nivel (ej: 'pasante' o 'internar')
      const levelCode = String(currentLevel.codigo).toLowerCase();
      const taskLevelId = String(t.nivel_id).toLowerCase();
      
      if (levelCode === taskLevelId) return true;
      
      // Mapeo especial para pasante
      if ((levelCode === 'pasante' || levelCode === 'internar') && 
          (taskLevelId === 'pasante' || taskLevelId === 'l1' || taskLevelId === 'internar')) return true;
      
  // Mapeo para S1, S2, etc.
      if (levelCode.startsWith('s') && (taskLevelId === levelCode || taskLevelId === String(currentLevel.id).toLowerCase())) return true;
    }
    return false;
  });

  console.log(`[Queries] Tareas filtradas para mostrar: ${localTasks.length}`);
  
  // Si después de todo sigue vacío, pero el usuario es pasante, forzamos las tareas de pasante
  if (localTasks.length === 0 && (nivelId === 'l1' || String(currentLevel?.codigo) === 'pasante' || String(currentLevel?.codigo) === 'internar')) {
    const forcedTasks = (store.tasks || []).filter(t => t.nivel_id === 'pasante' || t.nivel_id === 'l1' || t.nivel_id === 'internar');
    console.log(`[Queries] Forzando tareas de pasante: ${forcedTasks.length}`);
    return forcedTasks;
  }

  return localTasks;
}

export async function getPremiosRuleta() {
  const { data, fallback } = await trySupabase(() => supabase.from('premios_ruleta').select('*').eq('activo', true).order('orden', { ascending: true }));
  if (!fallback) return data || [];
  const store = await getStore();
  return (store.premiosRuleta || []).filter(p => p.activo !== false).sort((a, b) => (a.orden || 0) - (b.orden || 0));
}

export async function getSorteosGanadores() {
  const { data, fallback } = await trySupabase(() => supabase.from('sorteos_ganadores').select('*, usuario:usuarios!usuario_id(telefono)').order('created_at', { ascending: false }).limit(50));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return (store.sorteosGanadores || []).slice(-50).reverse();
}


export async function createSorteoGanador(ganadorData) {
  const { data, fallback } = await trySupabase(() => supabase.from('sorteos_ganadores').insert([ganadorData]).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  if (!store.sorteosGanadores) store.sorteosGanadores = [];
  store.sorteosGanadores.push(ganadorData);
  return ganadorData;
}

export async function getTaskById(id) {
  const { data, fallback } = await trySupabase(() => supabase.from('tareas').select('*').eq('id', id).maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  return (store.tasks || []).find(t => t.id === id);
}

export async function getTaskActivity(userId) {
  const { data, fallback } = await trySupabase(() => supabase.from('actividad_tareas').select('*').eq('usuario_id', userId));
  if (!fallback && data && data.length > 0) return data;
  const store = await getStore();
  return (store.actividadTareas || []).filter(a => a.usuario_id === userId);
}

export async function createTaskActivity(activity) {
  const { data, fallback } = await trySupabase(() => supabase.from('actividad_tareas').insert([activity]).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  if (!store.actividadTareas) store.actividadTareas = [];
  store.actividadTareas.push(activity);
  return activity;
}
