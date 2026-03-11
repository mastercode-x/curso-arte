import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Obtener calendario del profesor
export const getCalendar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const profesor = await prisma.profesor.findFirst({
    where: { userId },
    include: {
      calendarEvents: {
        orderBy: { orden: 'asc' }
      }
    }
  });

  if (!profesor) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  res.json({
    id: profesor.id,
    profesorId: profesor.id,
    events: profesor.calendarEvents || [],
    totalWeeks: profesor.calendarEvents?.length || 0
  });
});

// Obtener calendario público
export const getPublicCalendar = asyncHandler(async (req: Request, res: Response) => {
  const profesor = await prisma.profesor.findFirst({
    include: {
      calendarEvents: {
        orderBy: { orden: 'asc' }
      }
    }
  });

  if (!profesor) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  res.json({
    id: profesor.id,
    profesorId: profesor.id,
    events: profesor.calendarEvents || [],
    totalWeeks: profesor.calendarEvents?.length || 0
  });
});

// Crear evento de calendario
export const createCalendarEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { week, date, activity, module, orden } = req.body;

  if (!week || !date || !activity) {
    res.status(400).json({ error: 'Campos requeridos: week, date, activity' });
    return;
  }

  const profesor = await prisma.profesor.findFirst({
    where: { userId }
  });

  if (!profesor) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  const event = await prisma.calendarEvent.create({
    data: {
      profesorId: profesor.id,
      week,
      date,
      activity,
      module: module || null,
      orden: orden || 0
    }
  });

  logger.info(`Evento de calendario creado por profesor: ${profesor.id}`);

  res.status(201).json(event);
});

// Actualizar evento de calendario
export const updateCalendarEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { eventId } = req.params;
  const { week, date, activity, module, orden } = req.body;

  const profesor = await prisma.profesor.findFirst({
    where: { userId }
  });

  if (!profesor) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  // Verificar que el evento pertenece al profesor
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId }
  });

  if (!event || event.profesorId !== profesor.id) {
    res.status(403).json({ error: 'No tienes permiso para actualizar este evento' });
    return;
  }

  const updatedEvent = await prisma.calendarEvent.update({
    where: { id: eventId },
    data: {
      week: week || event.week,
      date: date || event.date,
      activity: activity || event.activity,
      module: module !== undefined ? module : event.module,
      orden: orden !== undefined ? orden : event.orden
    }
  });

  logger.info(`Evento de calendario actualizado por profesor: ${profesor.id}`);

  res.json(updatedEvent);
});

// Eliminar evento de calendario
export const deleteCalendarEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { eventId } = req.params;

  const profesor = await prisma.profesor.findFirst({
    where: { userId }
  });

  if (!profesor) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  // Verificar que el evento pertenece al profesor
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId }
  });

  if (!event || event.profesorId !== profesor.id) {
    res.status(403).json({ error: 'No tienes permiso para eliminar este evento' });
    return;
  }

  await prisma.calendarEvent.delete({
    where: { id: eventId }
  });

  logger.info(`Evento de calendario eliminado por profesor: ${profesor.id}`);

  res.json({ message: 'Evento eliminado exitosamente' });
});

// Actualizar todo el calendario
export const updateCalendar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { events } = req.body;

  const profesor = await prisma.profesor.findFirst({
    where: { userId }
  });

  if (!profesor) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  // Eliminar eventos existentes
  await prisma.calendarEvent.deleteMany({
    where: { profesorId: profesor.id }
  });

  // Crear nuevos eventos
  const createdEvents = await Promise.all(
    (events || []).map((event: any, index: number) =>
      prisma.calendarEvent.create({
        data: {
          profesorId: profesor.id,
          week: event.week,
          date: event.date,
          activity: event.activity,
          module: event.module || null,
          orden: event.orden || index
        }
      })
    )
  );

  logger.info(`Calendario actualizado por profesor: ${profesor.id}`);

  res.json({
    message: 'Calendario actualizado exitosamente',
    events: createdEvents
  });
});
