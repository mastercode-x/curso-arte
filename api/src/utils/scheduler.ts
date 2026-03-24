import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

/**
 * Inicia el scheduler que publica módulos programados automáticamente.
 * Se ejecuta cada minuto y publica cualquier módulo cuya scheduledPublishAt ya pasó.
 *
 * Llamar desde server.ts:
 *   import { startScheduler } from './utils/scheduler';
 *   startScheduler();
 *
 * Requiere: npm install node-cron @types/node-cron
 */
export const startScheduler = (): void => {
  // Ejecutar cada minuto: '* * * * *'
  cron.schedule('* * * * *', async () => {
    try {
      const ahora = new Date();

      const modulosAPublicar = await prisma.modulo.findMany({
        where: {
          estado: 'programado',
          scheduledPublishAt: {
            lte: ahora
          }
        },
        select: { id: true, titulo: true, scheduledPublishAt: true }
      });

      if (modulosAPublicar.length === 0) return;

      await prisma.modulo.updateMany({
        where: {
          id: { in: modulosAPublicar.map(m => m.id) }
        },
        data: {
          estado: 'publicado'
        }
      });

      for (const m of modulosAPublicar) {
        logger.info(`Scheduler: módulo publicado automáticamente — "${m.titulo}" (${m.id}) programado para ${m.scheduledPublishAt?.toISOString()}`);
      }
    } catch (error) {
      logger.error('Scheduler error al publicar módulos programados:', error);
    }
  });

  logger.info('✓ Scheduler de publicación de módulos iniciado (cada minuto)');
};