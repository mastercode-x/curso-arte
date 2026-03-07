import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { handleWebhook } from '../services/paymentService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Webhook para notificaciones de Mercado Pago
export const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    logger.info(`Webhook Mercado Pago recibido: ${JSON.stringify(req.body)}`);
    logger.info(`Headers: ${JSON.stringify(req.headers)}`);

    // Responder inmediatamente a Mercado Pago (requerido)
    res.status(200).send('OK');

    // Procesar la notificación de forma asíncrona
    const data = req.body;
    
    // Validar que sea una notificación válida
    if (!data || (!data.topic && !data.type && !data.action)) {
      logger.warn('Webhook recibido sin datos válidos');
      return;
    }

    // Procesar el webhook
    await handleWebhook(data);

  } catch (error) {
    logger.error('Error en webhook de Mercado Pago:', error);
    // Ya respondimos 200, el error se loguea pero no afecta la respuesta
  }
};

// Webhook para Google Forms - Nueva solicitud de acceso
export const googleFormsWebhook = async (req: Request, res: Response) => {
  try {
    logger.info(`Webhook Google Forms recibido: ${JSON.stringify(req.body)}`);

    const { nombre, email, telefono, pais, experiencia, interes } = req.body;

    // Validar datos requeridos
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
      logger.info(`Solicitud duplicada ignorada: ${email}`);
      res.status(200).json({ 
        message: 'Ya existe una solicitud pendiente',
        solicitudId: existingSolicitud.id
      });
      return;
    }

    // Verificar si ya existe un estudiante con este email
    const existingEstudiante = await prisma.estudiante.findFirst({
      where: {
        user: { email }
      }
    });

    if (existingEstudiante) {
      logger.info(`Estudiante ya registrado: ${email}`);
      res.status(200).json({ 
        message: 'Estudiante ya registrado',
        estudianteId: existingEstudiante.id
      });
      return;
    }

    // Crear solicitud
    const solicitud = await prisma.solicitudAcceso.create({
      data: {
        nombre,
        email,
        telefono: telefono || null,
        pais: pais || null,
        experiencia: experiencia || null,
        interes: interes || null,
        estado: 'pendiente'
      }
    });

    // Notificar al profesor por email
    try {
      const { sendNewApplicationNotification } = await import('../services/emailService');
      const config = await prisma.configuracionProfesor.findFirst({
        include: { profesor: { include: { user: true } } }
      });

      if (config?.emailNotificaciones) {
        await sendNewApplicationNotification(config.emailNotificaciones, nombre, email);
      }
    } catch (emailError) {
      logger.error('Error enviando notificación email:', emailError);
      // No fallar el webhook si el email falla
    }

    logger.info(`Nueva solicitud creada desde Google Forms: ${email}`);

    res.status(201).json({
      message: 'Solicitud recibida exitosamente',
      solicitudId: solicitud.id
    });

  } catch (error) {
    logger.error('Error en webhook de Google Forms:', error);
    res.status(500).json({ error: 'Error procesando solicitud' });
  }
};

// Health check para webhooks
export const webhookHealth = async (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    webhooks: {
      mercadopago: '/api/webhooks/mercadopago',
      googleforms: '/api/webhooks/google-forms'
    }
  });
};

// Endpoint para consultar estado de notificación (debug)
export const getNotificationStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    const { getPaymentByMPId } = await import('../services/paymentService');
    const paymentData = await getPaymentByMPId(paymentId);

    if (!paymentData) {
      res.status(404).json({ error: 'Pago no encontrado' });
      return;
    }

    res.json({
      paymentId: paymentData.id,
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      externalReference: paymentData.external_reference,
      transactionAmount: paymentData.transaction_amount,
      dateCreated: paymentData.date_created,
      dateApproved: paymentData.date_approved,
    });
  } catch (error) {
    logger.error('Error consultando estado de notificación:', error);
    res.status(500).json({ error: 'Error consultando estado' });
  }
};
