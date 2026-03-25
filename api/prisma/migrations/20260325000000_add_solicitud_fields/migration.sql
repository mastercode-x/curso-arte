-- AlterTable
ALTER TABLE "solicitudes_acceso" ADD COLUMN IF NOT EXISTS "disposicion" TEXT;
ALTER TABLE "solicitudes_acceso" ADD COLUMN IF NOT EXISTS "compromiso" TEXT;