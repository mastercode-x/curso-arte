import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { sendWelcomeEmailWithCredentials } from './emailService';
import crypto from 'crypto';

const prisma = new PrismaClient();

let mpClient: MercadoPagoConfig | null = null;

export const initMercadoPago = (): MercadoPagoConfig | null => {
  if (mpClient) return mpClient;
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    logger.warn('MP_ACCESS_TOKEN no configurado');
    return null;
  }
  mpClient = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 }
  });
  return mpClient;
};

const generateTempPassword = (): string => crypto.randomBytes(8).toString('hex');

// ── Crear DOS preferencias de pago ───────────────────────────────
export const createPaymentLinks = async (
  estudianteId: string,
  email: string,
  nombre: string
): Promise<{
  pagoCompleto: { initPoint: string; preferenceId: string; monto: number };
  pagoEnCuotas: { initPoint: string; preferenceId: string; montoCuota: number };
} | null> => {
  try {
    const mpConfig = initMercadoPago();
    if (!mpConfig) throw new Error('Mercado Pago no inicializado');

    const config = await prisma.configuracionProfesor.findFirst();
    const precioTotal = config?.precioCurso?.toNumber() || 50000;
    const moneda = config?.moneda || 'ARS';
    const nombreCurso = config?.nombreCurso || 'Poética de la Mirada';
    // precioEnCuotas: si hay recargoCuotas, es precioCurso + recargoCuotas.
    // Si hay precioEnCuotas configurado directamente, lo usa. Si no, igual al precio completo.
    const recargoCuotas = config?.recargoCuotas?.toNumber() || 0;
    const precioEnCuotas = recargoCuotas > 0
      ? precioTotal + recargoCuotas
      : (config?.precioEnCuotas?.toNumber() || precioTotal);
    const montoCuota = Math.ceil(precioEnCuotas / 2);
    const backendUrl = process.env.BACKEND_URL!;
    const frontendUrl = process.env.FRONTEND_URL!;

    const preference = new Preference(mpConfig);

    // ── Preferencia 1: Pago completo ──────────────────────────
    const prefCompleto = await preference.create({
      body: {
        items: [{
          id: `completo-${estudianteId}`,
          title: nombreCurso,
          description: 'Pago completo del curso',
          quantity: 1,
          unit_price: precioTotal,
          currency_id: moneda,
        }],
        payer: { email, name: nombre },
        external_reference: `${estudianteId}|completo`,
        notification_url: `${backendUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${frontendUrl}/#/pago-exitoso`,
          failure: `${frontendUrl}/#/pago-fallido`,
          pending: `${frontendUrl}/#/pago-pendiente`,
        },
        auto_return: 'approved',
        statement_descriptor: 'POETICA DE LA MIRADA',
      }
    });

    // ── Preferencia 2: Primera cuota ──────────────────────────
    const prefCuota1 = await preference.create({
      body: {
        items: [{
          id: `cuota1-${estudianteId}`,
          title: `${nombreCurso} — Cuota 1 de 2`,
          description: 'Primera cuota del curso (segunda cuota en 30 días)',
          quantity: 1,
          unit_price: montoCuota,
          currency_id: moneda,
        }],
        payer: { email, name: nombre },
        external_reference: `${estudianteId}|cuota1`,
        notification_url: `${backendUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${frontendUrl}/#/pago-exitoso`,
          failure: `${frontendUrl}/#/pago-fallido`,
          pending: `${frontendUrl}/#/pago-pendiente`,
        },
        auto_return: 'approved',
        statement_descriptor: 'POETICA DE LA MIRADA',
      }
    });

    // Guardar ambas preferencias como pagos pendientes
    await prisma.pago.createMany({
      data: [
        {
          estudianteId,
          monto: precioTotal,
          moneda,
          proveedor: 'mercadopago',
          referenciaExterna: prefCompleto.id!,
          estado: 'pendiente',
        },
        {
          estudianteId,
          monto: montoCuota,
          moneda,
          proveedor: 'mercadopago',
          referenciaExterna: prefCuota1.id!,
          estado: 'pendiente',
        }
      ]
    });

    logger.info(`Links de pago creados para ${email} — completo: ${prefCompleto.id} | cuota1: ${prefCuota1.id}`);

    return {
      pagoCompleto: {
        initPoint: prefCompleto.init_point!,
        preferenceId: prefCompleto.id!,
        monto: precioTotal,
      },
      pagoEnCuotas: {
        initPoint: prefCuota1.init_point!,
        preferenceId: prefCuota1.id!,
        montoCuota,
      },
    };
  } catch (error) {
    logger.error('Error creando links de pago:', error);
    return null;
  }
};

// ── Mantener función legacy para compatibilidad ───────────────────
export const createCheckoutPreference = async (
  estudianteId: string,
  email: string,
  nombre: string,
  monto: number,
  moneda: string = 'ARS'
) => {
  const links = await createPaymentLinks(estudianteId, email, nombre);
  if (!links) return null;
  return {
    preferenceId: links.pagoCompleto.preferenceId,
    initPoint: links.pagoCompleto.initPoint,
    sandboxInitPoint: links.pagoCompleto.initPoint,
  };
};

// ── Webhook handler ───────────────────────────────────────────────
const processMerchantOrder = async (resourceUrl: string) => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return;
    const response = await fetch(resourceUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) return;
    const order = await response.json() as any;
    if (order.payments?.length > 0) {
      for (const payment of order.payments) {
        if (payment.status === 'approved') {
          await processPaymentNotification(payment.id.toString());
        }
      }
    }
  } catch (error) {
    logger.error('Error procesando merchant order:', error);
  }
};

export const handleWebhook = async (data: any): Promise<boolean> => {
  try {
    logger.info(`Webhook recibido: ${JSON.stringify(data)}`);
    const { topic, id, type, data_id } = data;

    if (topic === 'payment' || type === 'payment') {
      const paymentId = id || data_id;
      if (paymentId) await processPaymentNotification(paymentId);
    } else if (data.action === 'payment.created' || data.action === 'payment.updated') {
      if (data.data?.id) await processPaymentNotification(data.data.id);
    } else if (topic === 'merchant_order') {
      if (data.resource) await processMerchantOrder(data.resource);
    }
    return true;
  } catch (error) {
    logger.error('Error procesando webhook:', error);
    return false;
  }
};

const processPaymentNotification = async (paymentId: string) => {
  try {
    const mpConfig = initMercadoPago();
    if (!mpConfig) throw new Error('MP no inicializado');

    const payment = new Payment(mpConfig);
    const paymentData = await payment.get({ id: paymentId });
    logger.info(`Pago ${paymentId}: status=${paymentData.status}, ref=${paymentData.external_reference}`);

    const externalReference = paymentData.external_reference;
    if (!externalReference) return;

    // Parsear: "estudianteId|tipoPago"
    const parts = externalReference.split('|');
    const estudianteId = parts[0];
    const tipoPago = parts[1] || 'completo'; // legacy sin | = completo

    const estudiante = await prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: { user: true }
    });

    if (!estudiante) {
      logger.error(`Estudiante no encontrado: ${estudianteId}`);
      return;
    }

    // Actualizar registro de pago
// Buscar el pago pendiente que corresponde a esta preferencia
// El external_reference viene como "estudianteId|tipoPago"
// Actualizamos solo el pago que tiene el monto correcto
const montoEsperado = tipoPago === 'completo'
  ? paymentData.transaction_amount
  : Math.ceil(((await prisma.configuracionProfesor.findFirst())?.precioEnCuotas?.toNumber() || (await prisma.configuracionProfesor.findFirst())?.precioCurso?.toNumber() || 50000) / 2);

await prisma.pago.updateMany({
  where: { 
    estudianteId: estudiante.id, 
    estado: 'pendiente',
    monto: montoEsperado
  },
  data: {
    referenciaExterna: paymentId,
    estado: mapMPStatus(paymentData.status),
    fechaPago: paymentData.status === 'approved' ? new Date() : null,
  }
});

    if (paymentData.status === 'approved') {
      await handlePaymentSuccess(estudiante, paymentData, tipoPago);
    }
  } catch (error) {
    logger.error('Error procesando notificación de pago:', error);
  }
};

const mapMPStatus = (mpStatus: string | undefined): 'pendiente' | 'completado' | 'fallido' | 'reembolsado' => {
  const map: Record<string, any> = {
    approved: 'completado',
    pending: 'pendiente',
    in_process: 'pendiente',
    rejected: 'fallido',
    cancelled: 'fallido',
    refunded: 'reembolsado',
    charged_back: 'reembolsado',
  };
  return map[mpStatus || ''] ?? 'pendiente';
};

const handlePaymentSuccess = async (estudiante: any, paymentData: any, tipoPago: string) => {
  try {
    const config = await prisma.configuracionProfesor.findFirst();
    const precioEnCuotas3 = config?.precioEnCuotas?.toNumber() || config?.precioCurso?.toNumber() || 50000;
    const montoCuota = Math.ceil(precioEnCuotas3 / 2);

    if (tipoPago === 'completo') {
      // ── Pago completo — acceso inmediato, no hay segunda cuota ──
      await activarEstudiante(estudiante, paymentData, 'completo', false);

    } else if (tipoPago === 'cuota1') {
      // ── Primera cuota — acceso inmediato, programar segunda cuota ──
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

      // Crear preferencia de segunda cuota
      const mpConfig = initMercadoPago();
      let cuota2InitPoint = '';
      let cuota2PreferenceId = '';

      if (mpConfig) {
        const preference = new Preference(mpConfig);
        const pref = await preference.create({
          body: {
            items: [{
              id: `cuota2-${estudiante.id}`,
              title: `${config?.nombreCurso || 'Poética de la Mirada'} — Cuota 2 de 2`,
              description: 'Segunda y última cuota del curso',
              quantity: 1,
              unit_price: montoCuota,
              currency_id: config?.moneda || 'ARS',
            }],
            payer: { email: estudiante.user.email, name: estudiante.user.nombre },
            external_reference: `${estudiante.id}|cuota2`,
            notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
            back_urls: {
              success: `${process.env.FRONTEND_URL}/#/pago-exitoso`,
              failure: `${process.env.FRONTEND_URL}/#/pago-fallido`,
              pending: `${process.env.FRONTEND_URL}/#/pago-pendiente`,
            },
            auto_return: 'approved',
          }
        });
        cuota2InitPoint = pref.init_point!;
        cuota2PreferenceId = pref.id!;
      }

      await activarEstudiante(estudiante, paymentData, 'cuotas', false, {
        fechaVencimientoCuota2: fechaVencimiento,
        cuota2PreferenceId,
        cuota2InitPoint,
      });

      // Enviar email recordatorio con link de segunda cuota
      const { sendCuota2ReminderEmail } = await import('./emailService');
      await sendCuota2ReminderEmail(
        estudiante.user.nombre,
        estudiante.user.email,
        cuota2InitPoint,
        montoCuota,
        config?.moneda || 'ARS',
        fechaVencimiento
      );

    } else if (tipoPago === 'cuota2') {
      // ── Segunda cuota pagada ──────────────────────────────────
      await prisma.estudiante.update({
        where: { id: estudiante.id },
        data: {
          cuota2Pagada: true,
          montoPagado: { increment: paymentData.transaction_amount || 0 },
        }
      });

      // Reactivar si estaba deshabilitado
      await prisma.user.update({
        where: { id: estudiante.userId },
        data: { estado: 'activo' }
      });

      logger.info(`Segunda cuota pagada: ${estudiante.id}`);
    }
  } catch (error) {
    logger.error('Error en handlePaymentSuccess:', error);
  }
};

const activarEstudiante = async (
  estudiante: any,
  paymentData: any,
  tipoPago: string,
  cuota2Pagada: boolean,
  extraData: any = {}
) => {
  const tempPassword = generateTempPassword();
  const hashedPassword = await import('bcryptjs').then(bc => bc.hash(tempPassword, 10));

  await prisma.estudiante.update({
    where: { id: estudiante.id },
    data: {
      estadoPago: 'pagado',
      fechaPago: new Date(),
      montoPagado: paymentData.transaction_amount || 0,
      metodoPago: `mercadopago-${tipoPago}`,
      referenciaTransaccion: paymentData.id?.toString(),
      fechaInscripcion: new Date(),
      tipoPago,
      cuota2Pagada,
      ...extraData,
    }
  });

  await prisma.user.update({
    where: { id: estudiante.userId },
    data: { password: hashedPassword }
  });

  const loginUrl = `${process.env.FRONTEND_URL}/#/login`;
  await sendWelcomeEmailWithCredentials(
    estudiante.user.nombre,
    estudiante.user.email,
    tempPassword,
    loginUrl
  );

  logger.info(`Estudiante activado: ${estudiante.id} (tipo: ${tipoPago})`);
};

// ── Scheduler: verificar cuotas vencidas ─────────────────────────
export const checkOverdueCuotas = async () => {
  try {
    const ahora = new Date();
    // 30 días → enviar recordatorio
    // 35 días → deshabilitar cuenta

    const estudiantesConCuotaPendiente = await prisma.estudiante.findMany({
      where: {
        tipoPago: 'cuotas',
        cuota2Pagada: false,
        fechaVencimientoCuota2: { not: null },
        estadoPago: 'pagado',
      },
      include: { user: true }
    });

    for (const est of estudiantesConCuotaPendiente) {
      if (!est.fechaVencimientoCuota2) continue;

      const diasDesdeVencimiento = Math.floor(
        (ahora.getTime() - est.fechaVencimientoCuota2.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diasDesdeVencimiento >= 5 && est.user.estado === 'activo') {
        // 5 días de gracia después del vencimiento → deshabilitar
        await prisma.user.update({
          where: { id: est.userId },
          data: { estado: 'inactivo' }
        });

        const { sendAccountDisabledEmail } = await import('./emailService');
        await sendAccountDisabledEmail(
          est.user.nombre,
          est.user.email,
          est.cuota2InitPoint || ''
        );

        logger.info(`Cuenta deshabilitada por cuota vencida: ${est.id}`);

      } else if (diasDesdeVencimiento >= -3 && diasDesdeVencimiento < 0) {
        // 3 días antes del vencimiento → recordatorio
        const { sendCuota2ReminderEmail } = await import('./emailService');
        const config = await prisma.configuracionProfesor.findFirst();
        const precioEnCuotas3 = config?.precioEnCuotas?.toNumber() || config?.precioCurso?.toNumber() || 50000;
    const montoCuota = Math.ceil(precioEnCuotas3 / 2);

        await sendCuota2ReminderEmail(
          est.user.nombre,
          est.user.email,
          est.cuota2InitPoint || '',
          montoCuota,
          config?.moneda || 'ARS',
          est.fechaVencimientoCuota2
        );

        logger.info(`Recordatorio de cuota enviado: ${est.id}`);
      }
    }
  } catch (error) {
    logger.error('Error en checkOverdueCuotas:', error);
  }
};

// ── Resto de funciones existentes (sin cambios) ───────────────────
export const getPaymentStatus = async (preferenceId: string) => {
  try {
    const pago = await prisma.pago.findFirst({
      where: { referenciaExterna: preferenceId },
      orderBy: { createdAt: 'desc' }
    });
    return pago?.estado || null;
  } catch (error) {
    logger.error('Error obteniendo estado de pago:', error);
    return null;
  }
};

export const getPaymentByMPId = async (paymentId: string) => {
  try {
    const mpConfig = initMercadoPago();
    if (!mpConfig) return null;
    const payment = new Payment(mpConfig);
    return await payment.get({ id: paymentId });
  } catch (error) {
    logger.error('Error obteniendo pago de MP:', error);
    return null;
  }
};

export const processRefund = async (pagoId: string): Promise<boolean> => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) throw new Error('MP_ACCESS_TOKEN no configurado');

    const pago = await prisma.pago.findUnique({ where: { id: pagoId } });
    if (!pago || pago.estado !== 'completado') throw new Error('Pago no encontrado o no completado');

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${pago.referenciaExterna}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Error de MP: ${JSON.stringify(err)}`);
    }

    await prisma.pago.update({ where: { id: pagoId }, data: { estado: 'reembolsado' } });
    await prisma.estudiante.update({ where: { id: pago.estudianteId }, data: { estadoPago: 'cancelado' } });

    logger.info(`Reembolso procesado: ${pagoId}`);
    return true;
  } catch (error) {
    logger.error('Error procesando reembolso:', error);
    return false;
  }
};