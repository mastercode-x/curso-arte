-- AlterTable
ALTER TABLE "estudiantes" 
ADD COLUMN IF NOT EXISTS "tipo_pago" TEXT,
ADD COLUMN IF NOT EXISTS "cuota2_pagada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "fecha_vencimiento_cuota2" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cuota2_preference_id" TEXT,
ADD COLUMN IF NOT EXISTS "cuota2_init_point" TEXT;