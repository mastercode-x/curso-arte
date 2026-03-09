import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener configuración SMTP desde la base de datos o variables de entorno
const getEmailConfig = async () => {
  // Primero intentar obtener de la base de datos
  const config = await prisma.configuracionProfesor.findFirst();
  
  if (config?.smtpHost && config?.smtpUser) {
    return {
      host: config.smtpHost,
      port: config.smtpPort || 587,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass || ''
      }
    };
  }

  // Fallback a variables de entorno
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };
};

// Crear transporter con configuración actual
const createTransporter = async () => {
  const config = await getEmailConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
      // AGREGAR ESTA LÍNEA para ayudar a resolver problemas de red en Railway
      servername: config.host 
    }
  });
};


// Verificar conexión SMTP
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    logger.info('Configuración de email verificada correctamente');
    return true;
  } catch (error) {
    logger.error('Error verificando configuración de email:', error);
    return false;
  }
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  fromName: string = 'Poética de la Mirada'
): Promise<boolean> => {
  try {
    const transporter = await createTransporter();
    const config = await getEmailConfig();
    
    await transporter.sendMail({
      from: `"${fromName}" <${config.auth.user}>`,
      to,
      subject,
      html
    });

    logger.info(`Email enviado a ${to}: ${subject}`);
    return true;
  } catch (error) {
    logger.error('Error enviando email:', error);
    return false;
  }
};

// Templates de email
export const emailTemplates = {
  welcome: (nombre: string, loginUrl: string) => ({
    subject: '¡Bienvenido a Poética de la Mirada!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #C7A36D 0%, #8B7355 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Poética de la Mirada</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #C7A36D;">¡Hola ${nombre}!</h2>
          <p>Tu pago ha sido confirmado y ahora tienes acceso completo al curso <strong>Poética de la Mirada</strong>.</p>
          <p>Para comenzar, inicia sesión en tu cuenta:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: #C7A36D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Acceder al Curso
            </a>
          </div>
          <p>¡Nos vemos en clase!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            Poética de la Mirada - Curso de Arte Online
          </p>
        </div>
      </div>
    `
  }),

  welcomeWithCredentials: (nombre: string, email: string, password: string, loginUrl: string) => ({
    subject: '¡Bienvenido a Poética de la Mirada! - Tus credenciales de acceso',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #C7A36D 0%, #8B7355 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Poética de la Mirada</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #C7A36D;">¡Hola ${nombre}!</h2>
          <p>¡Felicidades! Tu pago para el curso <strong>Poética de la Mirada</strong> ha sido confirmado.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C7A36D;">
            <h3 style="margin-top: 0; color: #333;">Tus credenciales de acceso:</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Contraseña temporal:</strong> <code style="background: #fff; padding: 6px 12px; border-radius: 4px; border: 1px solid #ddd; font-family: monospace;">${password}</code></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: #C7A36D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Iniciar Sesión
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
            </p>
          </div>
          
          <p>¡Estamos emocionados de tenerte a bordo!</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            Poética de la Mirada - Curso de Arte Online
          </p>
        </div>
      </div>
    `
  }),

  paymentApproved: (nombre: string, paymentUrl: string, monto: number, moneda: string) => ({
    subject: '¡Solicitud Aprobada! Completa tu inscripción',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #C7A36D 0%, #8B7355 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Poética de la Mirada</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #C7A36D;">¡Felicidades ${nombre}!</h2>
          <p>Tu solicitud para el curso <strong>Poética de la Mirada</strong> ha sido <strong style="color: #28a745;">APROBADA</strong>.</p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 18px;">Monto a pagar:</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #28a745;">${moneda} ${monto.toLocaleString()}</p>
          </div>
          
          <p>Para completar tu inscripción, realiza el pago haciendo clic en el siguiente botón:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentUrl}" style="display: inline-block; background: #C7A36D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Realizar Pago
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">El pago se procesa de forma segura a través de Mercado Pago.</p>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            Poética de la Mirada - Curso de Arte Online
          </p>
        </div>
      </div>
    `
  }),

  applicationRejected: (nombre: string, motivo?: string) => ({
    subject: 'Actualización sobre tu solicitud',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #C7A36D 0%, #8B7355 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Poética de la Mirada</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #C7A36D;">Hola ${nombre}</h2>
          <p>Hemos revisado tu solicitud para el curso <strong>Poética de la Mirada</strong>.</p>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #721c24;">En esta ocasión, <strong>no podemos aprobar tu solicitud</strong>.</p>
          </div>
          
          ${motivo ? `
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Motivo:</strong> ${motivo}</p>
          </div>
          ` : ''}
          
          <p>Puedes intentar solicitar acceso nuevamente en el futuro si tus circunstancias cambian.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            Poética de la Mirada - Curso de Arte Online
          </p>
        </div>
      </div>
    `
  }),

  newApplication: (nombre: string, email: string, telefono?: string, pais?: string) => ({
    subject: 'Nueva solicitud de acceso - Poética de la Mirada',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #C7A36D 0%, #8B7355 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Poética de la Mirada</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #C7A36D;">Nueva Solicitud de Acceso</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Nombre:</strong> ${nombre}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            ${telefono ? `<p style="margin: 8px 0;"><strong>Teléfono:</strong> ${telefono}</p>` : ''}
            ${pais ? `<p style="margin: 8px 0;"><strong>País:</strong> ${pais}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/profesor/solicitudes" style="display: inline-block; background: #C7A36D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Revisar Solicitudes
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            Poética de la Mirada - Sistema Automático
          </p>
        </div>
      </div>
    `
  }),

  registrationLink: (nombre: string, registrationUrl: string) => ({
    subject: '¡Tu acceso al curso está listo! Crea tu contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #C7A36D 0%, #8B7355 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Poética de la Mirada</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #C7A36D;">¡Hola ${nombre}!</h2>
          <p>¡Felicidades! Tu pago para el curso <strong>Poética de la Mirada</strong> ha sido confirmado.</p>
          <p>Para completar tu inscripción y acceder a la plataforma, por favor crea tu cuenta:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationUrl}" style="display: inline-block; background: #C7A36D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Crear mi Cuenta
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Este enlace es personal y te permitirá establecer tu contraseña.</p>
          
          <p>¡Estamos emocionados de tenerte a bordo!</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            Poética de la Mirada - Curso de Arte Online
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (nombre: string, resetUrl: string) => ({
    subject: 'Restablecer contraseña - Poética de la Mirada',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #C7A36D 0%, #8B7355 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Poética de la Mirada</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #C7A36D;">Restablecer Contraseña</h2>
          <p>Hola ${nombre},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #C7A36D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Restablecer Contraseña
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              ⏰ Este enlace expirará en 1 hora.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este email.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            Poética de la Mirada - Curso de Arte Online
          </p>
        </div>
      </div>
    `
  }),

  paymentReminder: (nombre: string, paymentUrl: string, monto: number, moneda: string, diasRestantes: number) => ({
    subject: 'Recordatorio: Completa tu inscripción',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #C7A36D 0%, #8B7355 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Poética de la Mirada</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #C7A36D;">Hola ${nombre}</h2>
          <p>Te recordamos que tienes un pago pendiente para completar tu inscripción al curso <strong>Poética de la Mirada</strong>.</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px;">Monto pendiente:</p>
            <p style="margin: 10px 0; font-size: 28px; font-weight: bold; color: #856404;">${moneda} ${monto.toLocaleString()}</p>
            <p style="margin: 0; color: #856404;">⏰ Quedan ${diasRestantes} días</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentUrl}" style="display: inline-block; background: #C7A36D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Completar Pago
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            Poética de la Mirada - Curso de Arte Online
          </p>
        </div>
      </div>
    `
  })
};

// Funciones de envío de emails específicos
export const sendWelcomeEmail = async (nombre: string, email: string, loginUrl: string) => {
  const template = emailTemplates.welcome(nombre, loginUrl);
  return sendEmail(email, template.subject, template.html);
};

export const sendWelcomeEmailWithCredentials = async (nombre: string, email: string, password: string, loginUrl: string) => {
  const template = emailTemplates.welcomeWithCredentials(nombre, email, password, loginUrl);
  return sendEmail(email, template.subject, template.html);
};

export const sendRegistrationLinkEmail = async (nombre: string, email: string, registrationUrl: string) => {
  const template = emailTemplates.registrationLink(nombre, registrationUrl);
  return sendEmail(email, template.subject, template.html);
};

export const sendPaymentApprovedEmail = async (
  nombre: string, 
  email: string, 
  paymentUrl: string,
  monto: number,
  moneda: string
) => {
  const template = emailTemplates.paymentApproved(nombre, paymentUrl, monto, moneda);
  return sendEmail(email, template.subject, template.html);
};

export const sendApplicationRejectedEmail = async (nombre: string, email: string, motivo?: string) => {
  const template = emailTemplates.applicationRejected(nombre, motivo);
  return sendEmail(email, template.subject, template.html);
};

export const sendNewApplicationNotification = async (profesorEmail: string, nombre: string, email: string, telefono?: string, pais?: string) => {
  const template = emailTemplates.newApplication(nombre, email, telefono, pais);
  return sendEmail(profesorEmail, template.subject, template.html);
};

export const sendPasswordResetEmail = async (nombre: string, email: string, resetUrl: string) => {
  const template = emailTemplates.passwordReset(nombre, resetUrl);
  return sendEmail(email, template.subject, template.html);
};

export const sendPaymentReminderEmail = async (nombre: string, email: string, paymentUrl: string, monto: number, moneda: string, diasRestantes: number) => {
  const template = emailTemplates.paymentReminder(nombre, paymentUrl, monto, moneda, diasRestantes);
  return sendEmail(email, template.subject, template.html);
};
