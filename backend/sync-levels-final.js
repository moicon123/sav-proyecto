import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncLevels() {
  console.log('--- Sincronizando Niveles S1-S9 en Supabase ---');
  
  const defaultNiveles = [
    { codigo: 'pasante', nombre: 'Pasante', costo: 0, deposito: 0, tareas_diarias: 3, ganancia_tarea: 2, orden: 0, activo: true },
    { codigo: 'S1', nombre: 'Nivel S1', costo: 150, deposito: 150, tareas_diarias: 5, ganancia_tarea: 3, orden: 1, activo: true },
    { codigo: 'S2', nombre: 'Nivel S2', costo: 400, deposito: 400, tareas_diarias: 10, ganancia_tarea: 4, orden: 2, activo: true },
    { codigo: 'S3', nombre: 'Nivel S3', costo: 1000, deposito: 1000, tareas_diarias: 20, ganancia_tarea: 5, orden: 3, activo: true },
    { codigo: 'S4', nombre: 'Nivel S4', costo: 2500, deposito: 2500, tareas_diarias: 40, ganancia_tarea: 6.25, orden: 4, activo: true },
    { codigo: 'S5', nombre: 'Nivel S5', costo: 6000, deposito: 6000, tareas_diarias: 60, ganancia_tarea: 10, orden: 5, activo: true },
    { codigo: 'S6', nombre: 'Nivel S6', costo: 12000, deposito: 12000, tareas_diarias: 80, ganancia_tarea: 15, orden: 6, activo: true },
    { codigo: 'S7', nombre: 'Nivel S7', costo: 25000, deposito: 25000, tareas_diarias: 100, ganancia_tarea: 25, orden: 7, activo: true },
    { codigo: 'S8', nombre: 'Nivel S8', costo: 50000, deposito: 50000, tareas_diarias: 150, ganancia_tarea: 33.33, orden: 8, activo: true },
    { codigo: 'S9', nombre: 'Nivel S9', costo: 100000, deposito: 100000, tareas_diarias: 200, ganancia_tarea: 50, orden: 9, activo: true },
  ];

  for (const n of defaultNiveles) {
    const { error } = await supabase.from('niveles').upsert(n, { onConflict: 'codigo' });
    if (error) {
      console.error(`Error sincronizando ${n.codigo}:`, error.message);
    } else {
      console.log(`✅ ${n.codigo} sincronizado.`);
    }
  }
  
  console.log('--- Sincronización Finalizada ---');
}

syncLevels();
