import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Obtener módulos públicos (sin autenticación - para landing page)
export const getPublicModules = asyncHandler(async (req: Request, res: Response) => {
  const modulos = await prisma.modulo.findMany({
    where: { estado: 'publicado' },
    orderBy: { orden: 'asc' },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      duracion: true,
      orden: true,
      imagenUrl: true,
      contenido: true,
      objetivos: true,
      ejercicio: true,
      recursos: true,
    }
  });

  res.json(modulos);
});

// Obtener todos los módulos
// ─── FIX: El default 'publicado' ocultaba módulos "programado" al profesor ───
export const getModules = asyncHandler(async (req: Request, res: Response) => {
  const { estado } = req.query;
  const where: any = {};

  const isPublic = req.query.public === 'true';

  if (isPublic || req.user?.rol === 'estudiante') {
    // Estudiantes y acceso público: solo publicados
    where.estado = 'publicado';
  } else if (req.user?.rol === 'profesor') {
    // Profesor: mostrar TODOS los estados (publicado, borrador, programado)
    // Si pasa un filtro explícito por querystring, respetarlo
    if (estado && estado !== 'todos') {
      where.estado = estado;
    }
    // Si no pasa filtro → sin restricción de estado (muestra todo)
  } else {
    // Sin autenticación → solo publicados
    where.estado = 'publicado';
  }

  const modulos = await prisma.modulo.findMany({
    where,
    orderBy: { orden: 'asc' }
  });

  res.json(modulos);
});

// Obtener un módulo por ID
export const getModuleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const modulo = await prisma.modulo.findUnique({
    where: { id }
  });

  if (!modulo) {
    res.status(404).json({ error: 'Módulo no encontrado' });
    return;
  }

  if (req.user?.rol === 'estudiante' && modulo.estado !== 'publicado') {
    res.status(403).json({ error: 'No tiene acceso a este módulo' });
    return;
  }

  res.json(modulo);
});

// Obtener módulo por número de orden
export const getModuleByOrder = asyncHandler(async (req: Request, res: Response) => {
  const { order } = req.params;
  const orderNum = parseInt(order);

  if (isNaN(orderNum)) {
    res.status(400).json({ error: 'Número de módulo inválido' });
    return;
  }

  const modulo = await prisma.modulo.findFirst({
    where: { 
      orden: orderNum,
      estado: req.user?.rol === 'estudiante' ? 'publicado' : undefined
    }
  });

  if (!modulo) {
    res.status(404).json({ error: 'Módulo no encontrado' });
    return;
  }

  res.json(modulo);
});

// Crear módulo (solo profesor)
export const createModule = asyncHandler(async (req: Request, res: Response) => {
  const {
    titulo,
    descripcion,
    orden,
    moduloPrevioId,
    contenido,
    duracion,
    objetivos,
    ejercicio,
    recursos,
    imagenUrl,
    scheduledPublishAt,
    estado = 'borrador'
  } = req.body;

  if (!titulo) {
    res.status(400).json({ error: 'Título es requerido' });
    return;
  }

  let finalOrden = orden;
  if (finalOrden === undefined) {
    const lastModule = await prisma.modulo.findFirst({
      orderBy: { orden: 'desc' }
    });
    finalOrden = (lastModule?.orden || 0) + 1;
  }

  let finalScheduledPublishAt = scheduledPublishAt ? new Date(scheduledPublishAt) : null;
  let finalEstado = estado;

  if (finalScheduledPublishAt && estado === 'programado') {
    if (finalScheduledPublishAt <= new Date()) {
      res.status(400).json({ error: 'La fecha de publicación programada debe ser futura' });
      return;
    }
  }

  // Si programado pero sin fecha → borrador
  if (estado === 'programado' && !finalScheduledPublishAt) {
    finalEstado = 'borrador';
  }

  const modulo = await prisma.modulo.create({
    data: {
      titulo,
      descripcion,
      orden: finalOrden,
      moduloPrevioId,
      contenido: contenido || [],
      duracion: duracion || '2 semanas',
      objetivos: objetivos || [],
      ejercicio: ejercicio || {},
      recursos: recursos || [],
      imagenUrl: imagenUrl || null,
      scheduledPublishAt: finalScheduledPublishAt,
      estado: finalEstado
    }
  });

  logger.info(`Módulo creado: ${modulo.id} - ${titulo} - estado: ${finalEstado}`);

  res.status(201).json({
    message: 'Módulo creado exitosamente',
    modulo
  });
});

// Actualizar módulo (solo profesor)
export const updateModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    titulo,
    descripcion,
    orden,
    moduloPrevioId,
    contenido,
    duracion,
    objetivos,
    ejercicio,
    recursos,
    imagenUrl,
    scheduledPublishAt,
    estado
  } = req.body;

  const existingModule = await prisma.modulo.findUnique({ where: { id } });

  if (!existingModule) {
    res.status(404).json({ error: 'Módulo no encontrado' });
    return;
  }

  const updateData: any = {};

  if (titulo !== undefined) updateData.titulo = titulo;
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (orden !== undefined) updateData.orden = orden;
  if (moduloPrevioId !== undefined) updateData.moduloPrevioId = moduloPrevioId;
  if (contenido !== undefined) updateData.contenido = contenido;
  if (duracion !== undefined) updateData.duracion = duracion;
  if (objetivos !== undefined) updateData.objetivos = objetivos;
  if (ejercicio !== undefined) updateData.ejercicio = ejercicio;
  if (recursos !== undefined) updateData.recursos = recursos;
  if (imagenUrl !== undefined) updateData.imagenUrl = imagenUrl;

  // Manejar fecha programada
  if (scheduledPublishAt !== undefined) {
    updateData.scheduledPublishAt = scheduledPublishAt ? new Date(scheduledPublishAt) : null;
  }

  if (estado !== undefined) {
    if (estado === 'programado') {
      const fechaProgramada = updateData.scheduledPublishAt ?? existingModule.scheduledPublishAt;
      if (!fechaProgramada) {
        res.status(400).json({ error: 'Para programar un módulo, debe especificar una fecha de publicación' });
        return;
      }
      if (new Date(fechaProgramada) <= new Date()) {
        res.status(400).json({ error: 'La fecha de publicación programada debe ser futura' });
        return;
      }
    }
    // Si se cambia de 'programado' a otro estado, limpiar la fecha programada
    if (estado !== 'programado') {
      updateData.scheduledPublishAt = null;
    }
    updateData.estado = estado;
  }

  const modulo = await prisma.modulo.update({
    where: { id },
    data: updateData
  });

  logger.info(`Módulo actualizado: ${id} - estado: ${modulo.estado}`);

  res.json({
    message: 'Módulo actualizado exitosamente',
    modulo
  });
});

// Eliminar módulo (solo profesor)
export const deleteModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingModule = await prisma.modulo.findUnique({ where: { id } });

  if (!existingModule) {
    res.status(404).json({ error: 'Módulo no encontrado' });
    return;
  }

  const progresoCount = await prisma.progresoEstudiante.count({
    where: { moduloId: id }
  });

  if (progresoCount > 0) {
    res.status(400).json({ 
      error: 'No se puede eliminar el módulo porque tiene progreso de estudiantes asociado' 
    });
    return;
  }

  await prisma.modulo.delete({ where: { id } });

  logger.info(`Módulo eliminado: ${id}`);
  res.json({ message: 'Módulo eliminado exitosamente' });
});

// Toggle estado publicado/borrador (solo profesor)
export const publishModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { despublicar } = req.body;

  const existingModule = await prisma.modulo.findUnique({ where: { id } });

  if (!existingModule) {
    res.status(404).json({ error: 'Módulo no encontrado' });
    return;
  }

  const nuevoEstado = despublicar ? 'borrador' : 'publicado';

  const modulo = await prisma.modulo.update({
    where: { id },
    data: { 
      estado: nuevoEstado,
      // Limpiar fecha programada al despublicar
      scheduledPublishAt: despublicar ? null : existingModule.scheduledPublishAt
    }
  });

  logger.info(`Módulo ${despublicar ? 'despublicado' : 'publicado'}: ${id}`);

  res.json({
    message: `Módulo ${despublicar ? 'despublicado' : 'publicado'} exitosamente`,
    modulo
  });
});

// Programar publicación (solo profesor)
export const scheduleModulePublish = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { scheduledPublishAt } = req.body;

  if (!scheduledPublishAt) {
    res.status(400).json({ error: 'Fecha de publicación requerida' });
    return;
  }

  const fechaProgramada = new Date(scheduledPublishAt);

  if (fechaProgramada <= new Date()) {
    res.status(400).json({ error: 'La fecha de publicación debe ser futura' });
    return;
  }

  const existingModule = await prisma.modulo.findUnique({ where: { id } });

  if (!existingModule) {
    res.status(404).json({ error: 'Módulo no encontrado' });
    return;
  }

  const modulo = await prisma.modulo.update({
    where: { id },
    data: { 
      estado: 'programado',
      scheduledPublishAt: fechaProgramada
    }
  });

  logger.info(`Módulo programado: ${id} para ${fechaProgramada.toISOString()}`);

  res.json({
    message: 'Módulo programado exitosamente',
    modulo
  });
});

// Procesar publicaciones programadas (endpoint manual + llamado por scheduler)
export const processScheduledPublishes = asyncHandler(async (req: Request, res: Response) => {
  const ahora = new Date();

  const modulosAPublicar = await prisma.modulo.findMany({
    where: {
      estado: 'programado',
      scheduledPublishAt: { lte: ahora }
    }
  });

  if (modulosAPublicar.length === 0) {
    res.json({ message: 'No hay módulos para publicar', publicados: 0 });
    return;
  }

  const publicados = await Promise.all(
    modulosAPublicar.map(modulo =>
      prisma.modulo.update({
        where: { id: modulo.id },
        data: { estado: 'publicado' }
      })
    )
  );

  logger.info(`${publicados.length} módulos publicados automáticamente`);

  res.json({
    message: `${publicados.length} módulos publicados automáticamente`,
    publicados: publicados.length,
    modulos: publicados
  });
});

// Duplicar módulo (solo profesor)
export const duplicateModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingModule = await prisma.modulo.findUnique({ where: { id } });

  if (!existingModule) {
    res.status(404).json({ error: 'Módulo no encontrado' });
    return;
  }

  const lastModule = await prisma.modulo.findFirst({ orderBy: { orden: 'desc' } });
  const newOrden = (lastModule?.orden || 0) + 1;

  const newModule = await prisma.modulo.create({
    data: {
      titulo: `${existingModule.titulo} (Copia)`,
      descripcion: existingModule.descripcion,
      orden: newOrden,
      contenido: existingModule.contenido,
      duracion: existingModule.duracion,
      objetivos: existingModule.objetivos,
      ejercicio: existingModule.ejercicio,
      recursos: existingModule.recursos,
      estado: 'borrador'
    }
  });

  logger.info(`Módulo duplicado: ${id} -> ${newModule.id}`);

  res.status(201).json({
    message: 'Módulo duplicado exitosamente',
    modulo: newModule
  });
});

// Reordenar módulos (solo profesor)
export const reorderModules = asyncHandler(async (req: Request, res: Response) => {
  const { orders } = req.body;

  if (!Array.isArray(orders)) {
    res.status(400).json({ error: 'Formato inválido' });
    return;
  }

  await prisma.$transaction(
    orders.map(({ id, orden }) =>
      prisma.modulo.update({ where: { id }, data: { orden } })
    )
  );

  logger.info('Módulos reordenados');
  res.json({ message: 'Módulos reordenados exitosamente' });
});

// Estadísticas de módulos
export const getModuleStats = asyncHandler(async (req: Request, res: Response) => {
  const modulos = await prisma.modulo.findMany({
    include: { progreso: true }
  });

  const stats = modulos.map(modulo => ({
    id: modulo.id,
    titulo: modulo.titulo,
    orden: modulo.orden,
    estado: modulo.estado,
    scheduledPublishAt: modulo.scheduledPublishAt,
    totalEstudiantes: modulo.progreso.length,
    completados: modulo.progreso.filter(p => p.completudPorcentaje === 100).length,
    enProgreso: modulo.progreso.filter(p => p.completudPorcentaje > 0 && p.completudPorcentaje < 100).length,
    promedioCompletud: modulo.progreso.length > 0
      ? Math.round(modulo.progreso.reduce((acc, p) => acc + p.completudPorcentaje, 0) / modulo.progreso.length)
      : 0
  }));

  res.json(stats);
});