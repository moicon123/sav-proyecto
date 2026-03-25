import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getStore } from './src/data/store.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTasks() {
  console.log('--- Iniciando Seeding de Tareas en Supabase ---');
  
  // 1. Obtener niveles de la DB para mapear por código
  const { data: dbLevels, error: lError } = await supabase.from('niveles').select('id, codigo');
  if (lError) {
    console.error('Error obteniendo niveles:', lError.message);
    return;
  }
  
  const levelMap = {};
  dbLevels.forEach(l => {
    levelMap[l.codigo] = l.id;
    // También mapeamos los códigos antiguos si es necesario
    if (l.codigo === 'internar') levelMap['pasante'] = l.id;
    if (l.codigo === 'pasante') levelMap['internar'] = l.id;
  });

  // 2. Obtener tareas del store local
  const store = await getStore();
  const tasks = store.tasks || [];
  
  console.log(`Encontradas ${tasks.length} tareas en seed.js para procesar.`);

  for (const t of tasks) {
    // Buscar el nivel_id correcto (UUID)
    let dbNivelId = levelMap[t.nivel_id];
    
    // Si no se encuentra por el ID de nivel de seed (l1, l2...), intentamos buscar por código
    if (!dbNivelId) {
      if (t.nivel_id === 'pasante' || t.nivel_id === 'l1') dbNivelId = levelMap['internar'] || levelMap['pasante'];
      else if (t.nivel_id === 'S1') dbNivelId = levelMap['S1'];
      else if (t.nivel_id === 'S2') dbNivelId = levelMap['S2'];
      else if (t.nivel_id === 'S3') dbNivelId = levelMap['S3'];
    }

    if (!dbNivelId) {
      console.warn(`⚠️ No se encontró UUID de nivel para tarea ${t.nombre} (nivel_id: ${t.nivel_id})`);
      continue;
    }

    console.log(`Sincronizando tarea: ${t.nombre} para nivel ${t.nivel_id} -> ${dbNivelId}`);

    // Insertar o actualizar tarea (upsert basado en nombre y nivel para evitar duplicados)
    const { error: tError } = await supabase
      .from('tareas')
      .upsert({
        nombre: t.nombre,
        nivel_id: dbNivelId,
        descripcion: t.descripcion,
        recompensa: t.recompensa,
        video_url: t.video_url,
        pregunta: t.pregunta,
        respuesta_correcta: t.respuesta_correcta,
        opciones: t.opciones,
        activa: true
      }, { onConflict: 'nombre,nivel_id' }); // Necesitarías un índice único en nombre,nivel_id

    if (tError) {
      console.error(`❌ Error con tarea ${t.nombre}:`, tError.message);
      if (tError.message.includes('column') && tError.message.includes('does not exist')) {
        console.error('👉 RECUERDA: Debes ejecutar 003_fix_schema.sql en Supabase SQL Editor primero.');
        return;
      }
    } else {
      console.log(`✅ Tarea ${t.nombre} sincronizada.`);
    }
  }
  
  console.log('--- Seeding Finalizado ---');
}

seedTasks();
