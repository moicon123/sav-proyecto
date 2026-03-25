import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Client } = pg;

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL no está configurada en el archivo .env');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    console.log('⏳ Conectando a Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa.');

    const sql = `
      -- 1. Agregar columna para tickets de ruleta
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS tickets_ruleta INTEGER DEFAULT 0;

      -- 2. Agregar flag para el primer ascenso
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS primer_ascenso_completado BOOLEAN DEFAULT FALSE;

      -- 3. Asegurar que la tabla sorteos_ganadores exista
      CREATE TABLE IF NOT EXISTS sorteos_ganadores (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID REFERENCES usuarios(id),
          premio_id UUID REFERENCES premios_ruleta(id),
          monto DECIMAL(12,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      -- 4. Asegurar que premios_ruleta tenga las columnas necesarias
      ALTER TABLE premios_ruleta ADD COLUMN IF NOT EXISTS color TEXT;
      ALTER TABLE premios_ruleta ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
      ALTER TABLE premios_ruleta ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;
    `;

    console.log('⏳ Ejecutando migración...');
    await client.query(sql);
    console.log('🚀 ¡Base de datos actualizada correctamente!');

  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

migrate();
