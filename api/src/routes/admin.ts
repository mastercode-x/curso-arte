import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDashboardSummary,
  getConfig,
  updateConfig,
  setMPKeys,
  getDetailedStats,
  createInitialProfessor
} from '../controllers/adminController';
import { authenticate, requireProfessor } from '../middleware/auth';

const router = Router();

// Setup inicial (crear profesor) - solo disponible si no hay profesor
router.post(
  '/setup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('nombre').notEmpty().trim()
  ],
  createInitialProfessor
);

// Rutas protegidas (solo profesor)
router.get('/dashboard', authenticate, requireProfessor, getDashboardSummary);
router.get('/stats', authenticate, requireProfessor, getDetailedStats);
router.get('/config', authenticate, requireProfessor, getConfig);
router.get('/config/public', (req, res, next) => {
  // Endpoint público para la landing page
  req.query.public = 'true';
  next();
}, getConfig);
router.put(
  '/config',
  authenticate,
  requireProfessor,
  updateConfig
);
router.post(
  '/mp-keys',
  authenticate,
  requireProfessor,
  [
    body('mpAccessToken').notEmpty(),
    body('mpPublicKey').notEmpty()
  ],
  setMPKeys
);

export default router;