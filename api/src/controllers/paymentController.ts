import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { createCheckoutPreference, getPaymentStatus, processRefund } from '../services/paymentService';

const prisma = new PrismaClient();

// Crear sesión de pago con Mercado Pago
export const createPaymentSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const estudiante = await prisma.estudiante.findUnique({
    where: { userId },
    include: { user: true }
  });

  if (!estudiante) {
    res.status(404).json({ error: 'Estudiante no encontrado' });
    return;
  }

  if (estudiante.estadoPago === 'pagado') {
    res.status(400).json({ error: 'El pago ya fue completado' });
    return;
  }

  // Obtener precio del curso
  const config = await prisma.configuracionProfesor.findFirst();
  const precio = config?.precioCurso?.toNumber() || 50000; // Default 50,000 ARS
  const moneda = config?.moneda || 'ARS';

  const preference = await createCheckoutPreference(
    estudiante.id,
    estudiante.user.email,
    estudiante.user.nombre,
    precio,
    moneda
  );

  if (!preference) {
    res.status(500).json({ error: 'Error creando preferencia de pago' });
    return;
  }

  res.json({
    preferenceId: preference.preferenceId,
    initPoint: preference.initPoint,
    sandboxInitPoint: preference.sandboxInitPoint
  });
});

// Verificar estado de pago
export const checkPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { preferenceId } = req.params;

  const status = await getPaymentStatus(preferenceId);

  if (!status) {
    res.status(404).json({ error: 'Preferencia no encontrada' });
    return;
  }

  res.json({ status });
});

// Obtener historial de pagos del estudiante
export const getMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const estudiante = await prisma.estudiante.findUnique({
    where: { userId }
  });

  if (!estudiante) {
    res.status(404).json({ error: 'Estudiante no encontrado' });
    return;
  }

  const pagos = await prisma.pago.findMany({
    where: { estudianteId: estudiante.id },
    orderBy: { createdAt: 'desc' }
  });

  res.json(pagos);
});

// Obtener todos los pagos (solo profesor)
export const getAllPayments = asyncHandler(async (req: Request, res: Response) => {
  const { estado, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (estado) {
    where.estado = estado;
  }

  const [pagos, total] = await Promise.all([
    prisma.pago.findMany({
      where,
      include: {
        estudiante: {
          include: {
            user: {
              select: {
                nombre: true,
                email: true
              }
            }
          }
        }
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.pago.count({ where })
  ]);

  const pagosFormateados = pagos.map(p => ({
    id: p.id,
    estudianteId: p.estudianteId,
    nombre: p.estudiante.user.nombre,
    email: p.estudiante.user.email,
    monto: p.monto,
    moneda: p.moneda,
    proveedor: p.proveedor,
    estado: p.estado,
    fechaPago: p.fechaPago,
    createdAt: p.createdAt
  }));

  res.json({
    pagos: pagosFormateados,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// Estadísticas de pagos (solo profesor)
export const getPaymentStats = asyncHandler(async (req: Request, res: Response) => {
  const [totalPagos, pagosCompletados, pagosPendientes, pagosReembolsados] = await Promise.all([
    prisma.pago.count(),
    prisma.pago.count({ where: { estado: 'completado' } }),
    prisma.pago.count({ where: { estado: 'pendiente' } }),
    prisma.pago.count({ where: { estado: 'reembolsado' } })
  ]);

  // Ingresos totales
  const ingresos = await prisma.pago.aggregate({
    where: { estado: 'completado' },
    _sum: { monto: true }
  });

  // Ingresos por mes (últimos 6 meses)
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  const ingresosPorMes = await prisma.pago.groupBy({
    by: ['moneda'],
    where: {
      estado: 'completado',
      fechaPago: {
        gte: seisMesesAtras
      }
    },
    _sum: {
      monto: true
    }
  });

  res.json({
    totalPagos,
    pagosCompletados,
    pagosPendientes,
    pagosReembolsados,
    ingresosTotales: ingresos._sum.monto || 0,
    ingresosPorMes
  });
});

// Procesar reembolso (solo profesor)
export const processPaymentRefund = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const success = await processRefund(id);

  if (!success) {
    res.status(500).json({ error: 'Error procesando reembolso' });
    return;
  }

  logger.info(`Reembolso procesado: ${id}`);
  res.json({ message: 'Reembolso procesado exitosamente' });
});

// Configurar precio del curso (solo profesor)
export const setCoursePrice = asyncHandler(async (req: Request, res: Response) => {
  const { precio, moneda = 'ARS' } = req.body;

  if (!precio || precio <= 0) {
    res.status(400).json({ error: 'Precio inválido' });
    return;
  }

  const profesor = await prisma.profesor.findFirst();

  if (!profesor) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  const config = await prisma.configuracionProfesor.upsert({
    where: { profesorId: profesor.id },
    update: {
      precioCurso: precio,
      moneda
    },
    create: {
      profesorId: profesor.id,
      nombreCurso: 'Poética de la Mirada',
      precioCurso: precio,
      moneda
    }
  });

  logger.info(`Precio del curso actualizado: ${precio} ${moneda}`);

  res.json({
    message: 'Precio actualizado exitosamente',
    config: {
      precio: config.precioCurso,
      moneda: config.moneda
    }
  });
});

// Obtener configuración de precios
export const getCoursePrice = asyncHandler(async (req: Request, res: Response) => {
  const config = await prisma.configuracionProfesor.findFirst({
    select: {
      precioCurso: true,
      moneda: true
    }
  });

  if (!config) {
    res.json({
      precio: 50000,
      moneda: 'ARS'
    });
    return;
  }

  res.json({
    precio: config.precioCurso,
    moneda: config.moneda
  });
});

// Verificar pago pendiente de un estudiante
export const checkPendingPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const estudiante = await prisma.estudiante.findUnique({
    where: { userId },
    include: { 
      pagos: {
        where: { estado: 'pendiente' },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!estudiante) {
    res.status(404).json({ error: 'Estudiante no encontrado' });
    return;
  }

  const pendingPayment = estudiante.pagos[0];

  res.json({
    hasPendingPayment: !!pendingPayment,
    payment: pendingPayment || null,
    estadoPago: estudiante.estadoPago
  });
});
