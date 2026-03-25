import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log('--- Corrigiendo Esquema de Base de Datos ---');
  
  // Usamos RPC para ejecutar SQL si estuviera disponible, pero como no lo está directamente,
  // vamos a intentar insertar una tarea con las nuevas columnas para ver si fallan, 
  // o mejor aún, simplemente informamos al usuario que debe ejecutar esto en el SQL Editor.
  
  // Pero espera, puedo intentar hacer un alter table si tengo la service role key.
  // Supabase JS SDK no permite ALTER TABLE directamente.
  
  console.log('IMPORTANTE: Ejecuta este SQL en el Editor de SQL de Supabase:');
  console.log(`
    ALTER TABLE niveles ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
    
    ALTER TABLE tareas ADD COLUMN IF NOT EXISTS video_url TEXT;
    ALTER TABLE tareas ADD COLUMN IF NOT EXISTS pregunta TEXT;
    ALTER TABLE tareas ADD COLUMN IF NOT EXISTS respuesta_correcta TEXT;
    ALTER TABLE tareas ADD COLUMN IF NOT EXISTS opciones JSONB;
  `);

  // Intentamos ver si las columnas existen
  const { error } = await supabase.from('niveles').select('activo').limit(1);
  if (error && error.message.includes('column "activo" does not exist')) {
    console.error('❌ ERROR: La columna "activo" no existe en "niveles".');
  } else {
    console.log('✅ La columna "activo" ya existe en "niveles" o hay otro error:', error?.message || 'Ninguno');
  }

  const { error: errorT } = await supabase.from('tareas').select('video_url').limit(1);
  if (errorT && errorT.message.includes('column "video_url" does not exist')) {
    console.error('❌ ERROR: La columna "video_url" no existe en "tareas".');
  } else {
    console.log('✅ La columna "video_url" ya existe en "tareas" o hay otro error:', errorT?.message || 'Ninguno');
  }
}

fixSchema();
