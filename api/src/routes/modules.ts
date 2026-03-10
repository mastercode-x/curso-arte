import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getModules,
  getModuleById,
  getModuleByOrder,
  createModule,
  updateModule,
  deleteModule,
  publishModule,
  scheduleModulePublish,
  processScheduledPublishes,
  duplicateModule,
  reorderModules,
  getModuleStats
} from '../controllers/moduleController';
import { authenticate, requireProfessor } from '../middleware/auth';

const router = Router();

// Rutas públicas (requieren autenticación pero no ser profesor)
router.get('/', (req, res, next) => {
  // Permitir acceso público si viene con query public=true
  if (req.query.public === 'true') return next();
  return authenticate(req, res, next);
}, getModules);
router.get('/stats', authenticate, requireProfessor, getModuleStats);
router.get('/by-order/:order', authenticate, getModuleByOrder);
router.get('/:id', authenticate, [param('id').notEmpty()], getModuleById);

// Rutas del profesor
router.post(
  '/',
  authenticate,
  requireProfessor,
  [body('titulo').notEmpty().trim()],
  createModule
);
router.put(
  '/:id',
  authenticate,
  requireProfessor,
  [param('id').notEmpty()],
  updateModule
);
router.delete('/:id', authenticate, requireProfessor, [param('id').notEmpty()], deleteModule);
router.post('/:id/publish', authenticate, requireProfessor, [param('id').notEmpty()], publishModule);
router.post('/:id/schedule', authenticate, requireProfessor, [param('id').notEmpty()], scheduleModulePublish);
router.post('/:id/duplicate', authenticate, requireProfessor, [param('id').notEmpty()], duplicateModule);
router.post('/reorder', authenticate, requireProfessor, reorderModules);

// Ruta para procesar publicaciones programadas (puede llamarse desde un cron job)
router.post('/process-scheduled', processScheduledPublishes);

export default router;
