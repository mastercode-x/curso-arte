-- Agregar variante 'programado' al enum EstadoModulo
ALTER TYPE "EstadoModulo" ADD VALUE IF NOT EXISTS 'programado';

-- Agregar columna scheduled_publish_at a modulos
ALTER TABLE "modulos" 
ADD COLUMN IF NOT EXISTS "scheduled_publish_at" TIMESTAMP(3);

-- Agregar google_form_url a configuracion_profesor si no existe
ALTER TABLE "configuracion_profesor"
ADD COLUMN IF NOT EXISTS "google_form_url" TEXT;