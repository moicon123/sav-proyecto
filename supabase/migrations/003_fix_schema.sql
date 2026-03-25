-- SAV - Fix schema columns and types
-- Ejecutar en Supabase SQL Editor

-- 1. Añadir columna activo a niveles si no existe
ALTER TABLE niveles ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- 2. Añadir columnas a tareas para coincidir con seed.js y backend
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS pregunta TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS respuesta_correcta TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS opciones JSONB;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS recompensa DECIMAL(12,2) DEFAULT 0;

-- 3. Asegurar que actividad_tareas tenga recompensa_otorgada
ALTER TABLE actividad_tareas ADD COLUMN IF NOT EXISTS recompensa_otorgada DECIMAL(12,2) DEFAULT 0;

-- 4. Añadir restricción única para permitir upsert por nombre y nivel
ALTER TABLE tareas ADD CONSTRAINT unique_tarea_nombre_nivel UNIQUE (nombre, nivel_id);

-- 5. (Opcional) Cambiar tipos de ID a TEXT si se prefiere usar IDs de seed.js, 
-- pero se recomienda usar UUIDs. Si prefieres seguir usando UUIDs, NO ejecutes esto.
-- ALTER TABLE niveles ALTER COLUMN id TYPE TEXT;
-- ALTER TABLE tareas ALTER COLUMN id TYPE TEXT;
-- ALTER TABLE usuarios ALTER COLUMN id TYPE TEXT;
-- ALTER TABLE actividad_tareas ALTER COLUMN tarea_id TYPE TEXT;
