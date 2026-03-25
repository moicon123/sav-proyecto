import { supabase, hasDb } from './db.js';
import { getStore } from '../data/store.js';
import { levels as seedLevels } from '../data/seed.js';

export async function trySupabase(operation) {
  if (!supabase || !hasDb()) {
    console.warn('[Supabase] No client configured, using memory fallback');
    return { data: null, error: new Error('No client'), fallback: true };
  }
  try {
    const { data, error } = await operation();
    if (error) {
      console.error('[Supabase Error Logged]:', JSON.stringify(error, null, 2));
      return { data: null, error, fallback: true };
    }
    return { data, error: null, fallback: false };
  } catch (err) {
    console.error('[Supabase Critical Logged]:', err);
    return { data: null, error: err, fallback: true };
  }
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

export async function createTarjeta(tarjetaData) {
  const { data, fallback } = await trySupabase(() => supabase.from('tarjetas_bancarias').insert([tarjetaData]).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  if (!store.tarjetas) store.tarjetas = [];
  store.tarjetas.push(tarjetaData);
  return tarjetaData;
}

export async function deleteTarjeta(id, userId) {
  const { fallback } = await trySupabase(() => supabase.from('tarjetas_bancarias').delete().eq('id', id).eq('usuario_id', userId));
  if (!fallback) return true;
  const store = await getStore();
  if (store.tarjetas) {
    store.tarjetas = store.tarjetas.filter(t => t.id !== id || t.usuario_id !== userId);
  }
  return true;
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
  // Intentar obtener tareas de Supabase
  const { data, fallback } = await trySupabase(() => supabase.from('tareas').select('*').eq('nivel_id', nivelId).eq('activa', true));
  
  // Si tenemos datos de Supabase, los usamos
  if (!fallback && data && data.length > 0) return data;

  // Si Supabase falló o no tiene datos, usamos el store local (seed.js)
  const store = await getStore();
  const levels = await getLevels();
  const currentLevel = levels.find(l => String(l.id) === String(nivelId)) || 
                       levels.find(l => String(l.codigo) === 'pasante' && (nivelId === 'l1' || nivelId === 'pasante' || String(nivelId).length > 20));
  
  const localTasks = (store.tasks || []).filter(t => {
    if (String(t.nivel_id) === String(nivelId)) return true;
    
    if (currentLevel) {
      if (String(t.nivel_id) === String(currentLevel.id)) return true;
      const levelCode = String(currentLevel.codigo).toLowerCase();
      const taskLevelId = String(t.nivel_id).toLowerCase();
      
      if (levelCode === taskLevelId) return true;
      
      if ((levelCode === 'pasante' || levelCode === 'internar') && 
          (taskLevelId === 'pasante' || taskLevelId === 'l1' || taskLevelId === 'internar')) return true;
      
      if (levelCode.startsWith('s') && (taskLevelId === levelCode || taskLevelId === String(currentLevel.id).toLowerCase())) return true;
    }
    return false;
  });

  if (localTasks.length === 0) {
    const genericTasks = (store.tasks || []).filter(t => 
      t.nivel_id === 'pasante' || t.nivel_id === 'l1' || t.nivel_id === 'S1'
    );
    return genericTasks;
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
  const store = await getStore();
  const localActivity = (store.actividadTareas || []).filter(a => a.usuario_id === userId);

  if (!fallback && data) {
    // Combinar datos de Supabase con locales para no perder nada durante la sesión
    const supabaseIds = new Set(data.map(d => d.id));
    const combined = [...data, ...localActivity.filter(la => !supabaseIds.has(la.id))];
    return combined;
  }
  
  return localActivity;
}

export async function createTaskActivity(activity) {
  const { data, fallback } = await trySupabase(() => supabase.from('actividad_tareas').insert([activity]).select().maybeSingle());
  if (!fallback && data) return data;
  const store = await getStore();
  if (!store.actividadTareas) store.actividadTareas = [];
  store.actividadTareas.push(activity);
  return activity;
}

/**
 * Procesa el ascenso de nivel de un usuario y otorga recompensas al invitador (Upline)
 */
export async function handleLevelUpRewards(userId, oldLevelId, newLevelId) {
  try {
    const user = await findUserById(userId);
    const levels = await getLevels();
    const newLevel = levels.find(l => l.id === newLevelId);
    
    if (!user || !newLevel || !user.invitado_por) return;

    // Lógica de tokens según nivel: S1=1, S2=2, S3=3, etc.
    const levelCode = String(newLevel.codigo).toUpperCase();
    let rewardTokens = 0;

    if (levelCode === 'S1') rewardTokens = 1;
    else if (levelCode === 'S2') rewardTokens = 2;
    else if (levelCode === 'S3') rewardTokens = 3;
    else if (levelCode.startsWith('S')) {
      const num = parseInt(levelCode.substring(1));
      if (!isNaN(num)) rewardTokens = num;
    }

    if (rewardTokens > 0) {
      const inviter = await findUserById(user.invitado_por);
      if (inviter) {
        console.log(`[Recompensas] Invitado ${user.nombre_usuario} subió a ${levelCode}. Otorgando ${rewardTokens} tokens a ${inviter.nombre_usuario}`);
        
        await updateUser(inviter.id, {
          oportunidades_sorteo: (Number(inviter.oportunidades_sorteo) || 0) + rewardTokens
        });
        
        // Registrar actividad si es necesario
      }
    }
  } catch (err) {
    console.error('[Recompensas] Error en handleLevelUpRewards:', err);
  }
}
/**
 * Distribuye comisiones a la línea ascendente (Upline)
 * Nivel A: 15%, Nivel B: 5%, Nivel C: 2%
 * + Comisión fija del 2% por tarea realizada (Subordinados)
 */
export async function distributeCommissions(userId, baseAmount) {
  console.log(`[Comisiones] Iniciando distribución para usuario ${userId}, monto base: ${baseAmount}`);
  
  try {
    const user = await findUserById(userId);
    if (!user || !user.invitado_por) return;

    // 1. Ganancia fija del 2% para el invitador directo por CADA tarea
    const directInviter = await findUserById(user.invitado_por);
    if (directInviter) {
      const taskBonus = Number((baseAmount * 0.02).toFixed(2));
      if (taskBonus > 0) {
        console.log(`[Comisiones] Bono Tarea 2%: Otorgando ${taskBonus} BOB a ${directInviter.nombre_usuario} por tarea de su invitado.`);
        await updateUser(directInviter.id, {
          saldo_comisiones: (Number(directInviter.saldo_comisiones) || 0) + taskBonus
        });
      }
    }

    // 2. Comisiones por niveles (A: 15%, B: 5%, C: 2%)
    const levels = [
      { key: 'A', percent: 0.15 },
      { key: 'B', percent: 0.05 },
      { key: 'C', percent: 0.02 }
    ];

    let currentUplineId = user.invitado_por;
    for (const config of levels) {
      if (!currentUplineId) break;
      const upline = await findUserById(currentUplineId);
      if (!upline) break;

      const commission = Number((baseAmount * config.percent).toFixed(2));
      if (commission > 0) {
        console.log(`[Comisiones] Red Nivel ${config.key}: Otorgando ${commission} BOB a ${upline.nombre_usuario}`);
        await updateUser(upline.id, {
          saldo_comisiones: (Number(upline.saldo_comisiones) || 0) + commission
        });
      }
      currentUplineId = upline.invitado_por;
    }
  } catch (err) {
    console.error('[Comisiones] Error:', err);
  }
}
