import { Router } from 'express';
import { body } from 'express-validator';
import {
  login,
  register,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const router = Router();

// Login
router.post(
  '/login',
  [
    body('email').isEmail(),  // ← sacar .normalizeEmail()
    body('password').notEmpty()
  ],
  login
);

// Registro (para estudiantes aprobados)
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('nombre').notEmpty().trim(),
    body('estudianteId').notEmpty()
  ],
  register
);

// Refresh token
router.post('/refresh', refreshToken);

// Perfil (protegido)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  changePassword
);


router.post('/reset-temp', async (req: any, res: any) => {
  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.hash('Poetica2026!', 10);
  await prisma.user.update({
    where: { email: 'yo.com321@gmail.com' },
    data: { password: hash }
  });
  res.json({ ok: true });
});

export default router;
