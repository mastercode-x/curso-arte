import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getCalendar,
  getPublicCalendar,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  updateCalendar
} from '../controllers/calendarController';
import { authenticate, requireProfessor } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.get('/public', getPublicCalendar);

// Rutas protegidas (solo profesor)
router.get('/', authenticate, requireProfessor, getCalendar);

router.post(
  '/events',
  authenticate,
  requireProfessor,
  [
    body('week').notEmpty().trim(),
    body('date').notEmpty().trim(),
    body('activity').notEmpty().trim(),
    body('module').optional().trim(),
  ],
  createCalendarEvent
);

router.put(
  '/events/:eventId',
  authenticate,
  requireProfessor,
  [
    param('eventId').notEmpty(),
    body('week').optional().trim(),
    body('date').optional().trim(),
    body('activity').optional().trim(),
    body('module').optional().trim(),
  ],
  updateCalendarEvent
);

router.delete(
  '/events/:eventId',
  authenticate,
  requireProfessor,
  [param('eventId').notEmpty()],
  deleteCalendarEvent
);

router.put(
  '/',
  authenticate,
  requireProfessor,
  [body('events').isArray()],
  updateCalendar
);

export default router;
