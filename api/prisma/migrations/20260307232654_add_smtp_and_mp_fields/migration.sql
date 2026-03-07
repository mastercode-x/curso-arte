/*
  Warnings:

  - You are about to drop the column `stripe_public_key` on the `configuracion_profesor` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_secret_key` on the `configuracion_profesor` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_webhook_secret` on the `configuracion_profesor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "configuracion_profesor" DROP COLUMN "stripe_public_key",
DROP COLUMN "stripe_secret_key",
DROP COLUMN "stripe_webhook_secret",
ADD COLUMN     "mp_access_token" TEXT,
ADD COLUMN     "mp_public_key" TEXT,
ADD COLUMN     "mp_webhook_secret" TEXT,
ADD COLUMN     "smtp_host" TEXT,
ADD COLUMN     "smtp_pass" TEXT,
ADD COLUMN     "smtp_port" INTEGER DEFAULT 587,
ADD COLUMN     "smtp_user" TEXT,
ALTER COLUMN "moneda" SET DEFAULT 'ARS';
