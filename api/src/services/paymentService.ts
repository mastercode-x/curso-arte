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

// Generar contraseña temporal segura
const generateTempPassword = (): string => {
  return crypto.randomBytes(8).toString('hex');
};

export const createCheckoutPreference = async (
  estudianteId: string,
  email: string,
  nombre: string,
  monto: number,
  moneda: string = 'ARS'
): Promise<{ preferenceId: string; initPoint: string; sandboxInitPoint: string } | null> => {
  try {
    const mpConfig = initMercadoPago();
    if (!mpConfig) {
      throw new Error('Mercado Pago no inicializado');
    }

    // Obtener configuración del profesor para el precio
    const config = await prisma.configuracionProfesor.findFirst();
    const precio = config?.precioCurso?.toNumber() || monto;
    const currency = config?.moneda || moneda;

    const preference = new Preference(mpConfig);
    
    const result = await preference.create({
      body: {
        items: [
          {
            id: `curso-${estudianteId}`,
            title: 'Poética de la Mirada - Curso Completo',
            description: 'Acceso completo al curso de arte online',
            quantity: 1,
            unit_price: precio,
            currency_id: currency,
          }
        ],
        payer: {
          email: email,
          name: nombre,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago-exitoso`,
          failure: `${process.env.FRONTEND_URL}/pago-fallido`,
          pending: `${process.env.FRONTEND_URL}/pago-pendiente`,
        },
        auto_return: 'approved',
        external_reference: estudianteId,
        notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
        statement_descriptor: 'POETICA DE LA MIRADA',
      }
    });

    // Guardar referencia del pago pendiente
    await prisma.pago.create({
      data: {
        estudianteId,
        monto: precio,
        moneda: currency,
        proveedor: 'mercadopago',
        referenciaExterna: result.id!,
        estado: 'pendiente'
      }
    });

    logger.info(`Preferencia de pago creada: ${result.id} para ${email}`);
    
    return {
      preferenceId: result.id!,
      initPoint: result.init_point!,
      sandboxInitPoint: result.sandbox_init_point!
    };
  } catch (error) {
    logger.error('Error creando preferencia de pago:', error);
    return null;
  }
};

// Procesar notificación de webhook de Mercado Pago
export const handleWebhook = async (data: any): Promise<boolean> => {
  try {
    logger.info(`Webhook recibido de Mercado Pago: ${JSON.stringify(data)}`);

    // Mercado Pago envía diferentes tipos de notificaciones
    // topic: 'payment' | 'merchant_order' | 'subscription'
    const { topic, id, type, data_id } = data;

    if (topic === 'payment' || type === 'payment') {
      const paymentId = id || data_id;
      if (paymentId) {
        await processPaymentNotification(paymentId);
      }
    } else if (data.action === 'payment.created' || data.action === 'payment.updated') {
      // Notificación por API v1
      const paymentData = data.data;
      if (paymentData && paymentData.id) {
        await processPaymentNotification(paymentData.id);
      }
    }

    return true;
  } catch (error) {
    logger.error('Error procesando webhook:', error);
    return false;
  }
};

// Procesar notificación de pago individual
const processPaymentNotification = async (paymentId: string) => {
  try {
    const mpConfig = initMercadoPago();
    if (!mpConfig) {
      throw new Error('Mercado Pago no inicializado');
    }

    const payment = new Payment(mpConfig);
    const paymentData = await payment.get({ id: paymentId });

    logger.info(`Estado del pago ${paymentId}: ${paymentData.status}`);

    const externalReference = paymentData.external_reference;
    if (!externalReference) {
      logger.error('No se encontró external_reference en el pago');
      return;
    }

    // Buscar el estudiante por external_reference
    const estudiante = await prisma.estudiante.findUnique({
      where: { id: externalReference },
      include: { user: true }
    });

    if (!estudiante) {
      logger.error(`Estudiante no encontrado: ${externalReference}`);
      return;
    }

    // Actualizar el pago en la base de datos
    await prisma.pago.updateMany({
      where: { 
        estudianteId: estudiante.id,
        estado: 'pendiente'
      },
      data: {
        referenciaExterna: paymentId,
        estado: mapMPStatusToInternalStatus(paymentData.status),
        fechaPago: paymentData.status === 'approved' ? new Date() : null
      }
    });

    // Si el pago fue aprobado, actualizar el estudiante
    if (paymentData.status === 'approved') {
      await handlePaymentSuccess(estudiante, paymentData);
    }

  } catch (error) {
    logger.error('Error procesando notificación de pago:', error);
  }
};

// Mapear estado de Mercado Pago a estado interno
const mapMPStatusToInternalStatus = (mpStatus: string | undefined): string => {
  const statusMap: Record<string, string> = {
    'approved': 'completado',
    'pending': 'pendiente',
    'in_process': 'pendiente',
    'rejected': 'fallido',
    'cancelled': 'fallido',
    'refunded': 'reembolsado',
    'charged_back': 'reembolsado'
  };
  return statusMap[mpStatus || ''] || 'pendiente';
};

// Manejar pago exitoso
const handlePaymentSuccess = async (estudiante: any, paymentData: any) => {
  try {
    // Generar contraseña temporal
    const tempPassword = generateTempPassword();
    const hashedPassword = await import('bcryptjs').then(bc => bc.hash(tempPassword, 10));

    // Actualizar estudiante
    await prisma.estudiante.update({
      where: { id: estudiante.id },
      data: {
        estadoPago: 'pagado',
        fechaPago: new Date(),
        montoPagado: paymentData.transaction_amount || 0,
        metodoPago: `mercadopago-${paymentData.payment_method_id || 'unknown'}`,
        referenciaTransaccion: paymentData.id?.toString(),
        fechaInscripcion: new Date()
      }
    });

    // Actualizar usuario con contraseña temporal
    await prisma.user.update({
      where: { id: estudiante.userId },
      data: { password: hashedPassword }
    });

    // Enviar email con credenciales de acceso
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    await sendWelcomeEmailWithCredentials(
      estudiante.user.nombre,
      estudiante.user.email,
      tempPassword,
      loginUrl
    );

    logger.info(`Pago exitoso procesado para estudiante: ${estudiante.id}`);
  } catch (error) {
    logger.error('Error procesando pago exitoso:', error);
  }
};

// Verificar estado de pago por preference ID
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

// Buscar pago por ID de Mercado Pago
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

// Procesar reembolso usando API REST de Mercado Pago
export const processRefund = async (pagoId: string): Promise<boolean> => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('MP_ACCESS_TOKEN no configurado');
    }

    const pago = await prisma.pago.findUnique({
      where: { id: pagoId }
    });

    if (!pago || pago.estado !== 'completado') {
      throw new Error('Pago no encontrado o no completado');
    }

    // Mercado Pago requiere el payment ID para reembolsar
    // Buscamos el payment ID en la referencia externa
    const mpPaymentId = pago.referenciaExterna;
    if (!mpPaymentId) {
      throw new Error('No se encontró referencia de pago en Mercado Pago');
    }

    // Realizar reembolso via API REST de Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error de MP: ${JSON.stringify(errorData)}`);
    }

    // Actualizar estado en la base de datos
    await prisma.pago.update({
      where: { id: pagoId },
      data: { estado: 'reembolsado' }
    });

    // Actualizar estado del estudiante
    await prisma.estudiante.update({
      where: { id: pago.estudianteId },
      data: { estadoPago: 'cancelado' }
    });

    logger.info(`Reembolso procesado: ${pagoId}`);
    return true;
  } catch (error) {
    logger.error('Error procesando reembolso:', error);
    return false;
  }
};