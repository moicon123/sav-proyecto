import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos PostgreSQL.');

    console.log('1. Añadiendo columna "activo" a la tabla "niveles"...');
    await client.query('ALTER TABLE niveles ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;');

    console.log('2. Añadiendo columnas a la tabla "tareas"...');
    await client.query('ALTER TABLE tareas ADD COLUMN IF NOT EXISTS video_url TEXT;');
    await client.query('ALTER TABLE tareas ADD COLUMN IF NOT EXISTS pregunta TEXT;');
    await client.query('ALTER TABLE tareas ADD COLUMN IF NOT EXISTS respuesta_correcta TEXT;');
    await client.query('ALTER TABLE tareas ADD COLUMN IF NOT EXISTS opciones JSONB;');
    await client.query('ALTER TABLE tareas ADD COLUMN IF NOT EXISTS recompensa DECIMAL(12,2) DEFAULT 0;');

    console.log('3. Asegurando que "actividad_tareas" tenga las columnas correctas...');
    // No cambiamos tarea_id a TEXT, mejor poblaremos tareas con UUIDs.
    // Pero necesitamos asegurar que "recompensa_otorgada" exista.
    await client.query('ALTER TABLE actividad_tareas ADD COLUMN IF NOT EXISTS recompensa_otorgada DECIMAL(12,2) DEFAULT 0;');

    console.log('✅ Esquema actualizado correctamente.');
  } catch (err) {
    console.error('❌ Error actualizando el esquema:', err.message);
  } finally {
    await client.end();
  }
}

fix();
