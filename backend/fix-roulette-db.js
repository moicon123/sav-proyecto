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

    console.log('1. Añadiendo columna "color" a la tabla "premios_ruleta"...');
    await client.query('ALTER TABLE premios_ruleta ADD COLUMN IF NOT EXISTS color TEXT;');
    
    console.log('2. Asegurando que "usuarios" tenga "oportunidades_sorteo"...');
    await client.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS oportunidades_sorteo INTEGER DEFAULT 0;');

    console.log('3. Asegurando que "premios_ruleta" tenga "probabilidad" como DECIMAL...');
    // Si ya existe, nos aseguramos de que sea decimal
    await client.query('ALTER TABLE premios_ruleta ALTER COLUMN probabilidad TYPE DECIMAL(12,2);');

    console.log('✅ Esquema actualizado correctamente.');
  } catch (err) {
    console.error('❌ Error actualizando el esquema:', err.message);
  } finally {
    await client.end();
  }
}

fix();
