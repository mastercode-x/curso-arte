import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getMyProgress,
  updateProgress,
  markModuleComplete,
  getDashboard,
  getStudents,
  getStudentDetail,
  updateStudentByProfessor,  // ← agregar
  deleteStudent
} from '../controllers/studentController';
import { authenticate, requireProfessor, requireStudent } from '../middleware/auth';

const router = Router();

// Rutas del estudiante actual (requieren autenticación de estudiante)
router.get('/me/dashboard', authenticate, requireStudent, getDashboard);
router.get('/me/progress', authenticate, requireStudent, getMyProgress);
router.post(
  '/me/progress/:moduloId',
  authenticate,
  requireStudent,
  [param('moduloId').notEmpty(), body('completudPorcentaje').isInt({ min: 0, max: 100 })],
  updateProgress
);
router.post(
  '/me/progress/:moduloId/complete',
  authenticate,
  requireStudent,
  [param('moduloId').notEmpty()],
  markModuleComplete
);


router.delete('/:id', authenticate, requireProfessor, deleteStudent);


// Rutas del profesor (gestión de estudiantes)
router.get('/', authenticate, requireProfessor, getStudents);
router.get('/:id', authenticate, requireProfessor, getStudentDetail);



// Agregar después de router.get('/:id', ...)
router.put('/:id', authenticate, requireProfessor, updateStudentByProfessor);
router.patch('/:id/toggle-active', authenticate, requireProfessor, updateStudentByProfessor);

export default router;
