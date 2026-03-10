-- Add imagenUrl column to Modulo table
ALTER TABLE "modulos" ADD COLUMN "imagen_url" TEXT;

-- Add scheduledPublishAt column to Modulo table
ALTER TABLE "modulos" ADD COLUMN "scheduled_publish_at" TIMESTAMP(3);

-- Add 'programado' to EstadoModulo enum
-- Note: PostgreSQL requires recreating the enum type
ALTER TABLE "modulos" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "modulos" ALTER COLUMN "estado" TYPE TEXT;
DROP TYPE "EstadoModulo";
CREATE TYPE "EstadoModulo" AS ENUM ('borrador', 'publicado', 'programado');
ALTER TABLE "modulos" ALTER COLUMN "estado" TYPE "EstadoModulo" USING "estado"::"EstadoModulo";
ALTER TABLE "modulos" ALTER COLUMN "estado" SET DEFAULT 'borrador';