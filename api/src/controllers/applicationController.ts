import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendPaymentApprovedWithOptionsEmail, sendApplicationRejectedEmail, sendNewApplicationNotification } from '../services/emailService';
import { createPaymentLinks } from '../services/paymentService';


const prisma = new PrismaClient();

// Crear nueva solicitud (desde Google Forms o manual)
export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, email, telefono, pais, experiencia, interes } = req.body;

  if (!nombre || !email) {
    res.status(400).json({ error: 'Nombre y email son requeridos' });
    return;
  }

  // Verificar si ya existe una solicitud pendiente
  const existingSolicitud = await prisma.solicitudAcceso.findFirst({
    where: {
      email,
      estado: 'pendiente'
    }
  });

  if (existingSolicitud) {
    res.status(400).json({ error: 'Ya existe una solicitud pendiente para este email' });
    return;
  }

  // Verificar si ya existe un estudiante con este email
  const existingEstudiante = await prisma.estudiante.findFirst({
    where: {
      user: { email }
    }
  });

  if (existingEstudiante) {
    res.status(400).json({ error: 'Ya existe un estudiante registrado con este email' });
    return;
  }

  // Crear solicitud
  const solicitud = await prisma.solicitudAcceso.create({
    data: {
      nombre,
      email,
      telefono,
      pais,
      experiencia,
      interes,
      estado: 'pendiente'
    }
  });

  // Notificar al profesor
  const config = await prisma.configuracionProfesor.findFirst({
    include: { profesor: { include: { user: true } } }
  });

  if (config?.emailNotificaciones) {
    await sendNewApplicationNotification(config.emailNotificaciones, nombre, email);
  }

  logger.info(`Nueva solicitud creada: ${email}`);

  res.status(201).json({
    message: 'Solicitud enviada exitosamente',
    solicitud: {
      id: solicitud.id,
      nombre: solicitud.nombre,
      email: solicitud.email,
      estado: solicitud.estado,
      fechaSolicitud: solicitud.fechaSolicitud
    }
  });
});

// Obtener todas las solicitudes (solo profesor)
export const getApplications = asyncHandler(async (req: Request, res: Response) => {
  const { estado, search, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (estado) {
    where.estado = estado;
  }

  if (search) {
    where.OR = [
      { nombre: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitudAcceso.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { fechaSolicitud: 'desc' }
    }),
    prisma.solicitudAcceso.count({ where })
  ]);

  res.json({
    solicitudes,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// Obtener detalle de una solicitud
export const getApplicationDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const solicitud = await prisma.solicitudAcceso.findUnique({
    where: { id },
    include: {
      estudiante: {
        include: {
          user: true
        }
      }
    }
  });

  if (!solicitud) {
    res.status(404).json({ error: 'Solicitud no encontrada' });
    return;
  }

  res.json(solicitud);
});

// Aprobar solicitud
export const approveApplication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const solicitud = await prisma.solicitudAcceso.findUnique({
    where: { id }
  });

  if (!solicitud) {
    res.status(404).json({ error: 'Solicitud no encontrada' });
    return;
  }

  if (solicitud.estado !== 'pendiente') {
    res.status(400).json({ error: 'La solicitud ya fue procesada' });
    return;
  }

  // Obtener configuración del curso
  const config = await prisma.configuracionProfesor.findFirst();
  const precioCurso = config?.precioCurso?.toNumber() || 50000;
  const moneda = config?.moneda || 'ARS';

  // Crear usuario y estudiante (sin contraseña aún)
  const user = await prisma.user.create({
    data: {
      email: solicitud.email,
      nombre: solicitud.nombre,
      rol: 'estudiante',
      estado: 'activo',
      estudiante: {
        create: {
          estadoAprobacion: 'aprobado',
          estadoPago: 'no_pagado',
          fechaAprobacion: new Date(),
          telefono: solicitud.telefono,
          pais: solicitud.pais,
          experiencia: solicitud.experiencia,
          interes: solicitud.interes
        }
      }
    },
    include: { estudiante: true }
  });

  // Actualizar solicitud
  const solicitudActualizada = await prisma.solicitudAcceso.update({
    where: { id },
    data: {
      estado: 'aprobado',
      fechaRevision: new Date(),
      estudianteId: user.estudiante?.id
    }
  });

// Crear links de pago (completo + cuotas)
let pagoCompleto = { initPoint: '', monto: precioCurso };
let pagoEnCuotas = { initPoint: '', montoCuota: Math.ceil(precioCurso / 2) };

if (user.estudiante) {
  try {
    const links = await createPaymentLinks(
      user.estudiante.id,
      user.email,
      user.nombre
    );
    if (links) {
      pagoCompleto = { initPoint: links.pagoCompleto.initPoint, monto: links.pagoCompleto.monto };
      pagoEnCuotas = { initPoint: links.pagoEnCuotas.initPoint, montoCuota: links.pagoEnCuotas.montoCuota };
    }
    logger.info(`Links de pago creados para ${user.email}`);
  } catch (mpErr) {
    logger.warn(`No se pudo crear links de pago para ${user.email}: ${mpErr}`);
  }
}

// Enviar email con las dos opciones

const emailEnviado = await sendPaymentApprovedWithOptionsEmail(
  solicitud.nombre,
  solicitud.email,
  pagoCompleto,
  pagoEnCuotas,
  config?.nombreCurso || 'Poética de la Mirada'  // config ya existe
);

if (emailEnviado) {
  logger.info(`Email de aprobación enviado a ${solicitud.email}`);
} else {
  logger.error(`FALLO al enviar email a ${solicitud.email}`);
}

res.json({
  message: 'Solicitud aprobada exitosamente',
  solicitud: solicitudActualizada,
  pagoCompleto: pagoCompleto.initPoint,
  pagoEnCuotas: pagoEnCuotas.initPoint,
  emailEnviado,
});



});

// Rechazar solicitud
export const rejectApplication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { motivo } = req.body;

  const solicitud = await prisma.solicitudAcceso.findUnique({
    where: { id }
  });

  if (!solicitud) {
    res.status(404).json({ error: 'Solicitud no encontrada' });
    return;
  }

  if (solicitud.estado !== 'pendiente') {
    res.status(400).json({ error: 'La solicitud ya fue procesada' });
    return;
  }

  const solicitudActualizada = await prisma.solicitudAcceso.update({
    where: { id },
    data: {
      estado: 'rechazado',
      fechaRevision: new Date(),
      motivoRechazo: motivo
    }
  });

  // Enviar email de rechazo
  await sendApplicationRejectedEmail(solicitud.nombre, solicitud.email, motivo);

  logger.info(`Solicitud rechazada: ${solicitud.email}`);

  res.json({
    message: 'Solicitud rechazada',
    solicitud: solicitudActualizada
  });
});

// Estadísticas de solicitudes
export const getApplicationStats = asyncHandler(async (req: Request, res: Response) => {
  const [total, pendientes, aprobadas, rechazadas] = await Promise.all([
    prisma.solicitudAcceso.count(),
    prisma.solicitudAcceso.count({ where: { estado: 'pendiente' } }),
    prisma.solicitudAcceso.count({ where: { estado: 'aprobado' } }),
    prisma.solicitudAcceso.count({ where: { estado: 'rechazado' } })
  ]);

  // Solicitudes por mes (últimos 6 meses)
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  const solicitudesPorMes = await prisma.solicitudAcceso.groupBy({
    by: ['estado'],
    where: {
      createdAt: {
        gte: seisMesesAtras
      }
    },
    _count: {
      id: true
    }
  });

  res.json({
    total,
    pendientes,
    aprobadas,
    rechazadas,
    tasaAprobacion: total > 0 ? Math.round((aprobadas / total) * 100) : 0,
    tasaRechazo: total > 0 ? Math.round((rechazadas / total) * 100) : 0,
    porMes: solicitudesPorMes
  });
});
