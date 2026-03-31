import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';


import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Si el host es gmail, usamos el servicio preconfigurado de nodemailer
  if (config.host.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: config.auth,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  // Para otros proveedores, mantenemos la configuración manual
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false,
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
    await resend.emails.send({
      from: `Poética de la Mirada <curso@ernestoengelcurso.site>`,
      to,
      subject,
      html
    });
    logger.info(`Email enviado a ${to}: ${subject}`);
    return true;
  } catch (error: any) {
    logger.error(`Error enviando email a ${to}: ${error?.message}`);
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
  }),


  // ── Agregar estos dos templates al objeto emailTemplates ──────────

// Dentro de emailTemplates, agregar:
paymentApprovedWithOptions: (
  nombre: string,
  pagoCompleto: { initPoint: string; monto: number },
  pagoEnCuotas: { initPoint: string; montoCuota: number },
  nombreCurso: string
) => ({
  subject: `¡Tu solicitud fue aprobada! — ${nombreCurso}`,
  html: `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0B0B0D; color: #F4F2EC; padding: 40px;">
      <div style="border-bottom: 1px solid rgba(199,163,109,0.3); padding-bottom: 24px; margin-bottom: 32px;">
        <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.2em; color: #C7A36D; text-transform: uppercase; margin: 0 0 8px 0;">${nombreCurso}</p>
        <h1 style="font-size: 28px; color: #F4F2EC; margin: 0; font-weight: normal;">¡Tu solicitud fue aprobada!</h1>
      </div>
      <p style="color: #B8B4AA; line-height: 1.7; margin-bottom: 28px;">
        Hola <strong style="color: #F4F2EC;">${nombre}</strong>, tu lugar en el curso está reservado. 
        Elegí la opción de pago que mejor se adapte a vos:
      </p>

      <!-- Opción 1: Pago completo -->
      <div style="border: 1px solid rgba(199,163,109,0.5); background: rgba(199,163,109,0.08); padding: 24px; margin-bottom: 16px;">
        <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: #C7A36D; text-transform: uppercase; margin: 0 0 6px 0;">Opción 1</p>
        <p style="font-size: 20px; color: #F4F2EC; margin: 0 0 6px 0; font-weight: bold;">Pago completo</p>
        <p style="color: #B8B4AA; margin: 0 0 20px 0; font-size: 14px;">
          Un solo pago de <strong style="color: #C7A36D;">$${pagoCompleto.monto.toLocaleString('es-AR')} ARS</strong> — acceso inmediato.
        </p>
        <a href="${pagoCompleto.initPoint}" style="display:inline-block;background:#C7A36D;color:#0B0B0D;padding:13px 28px;font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;font-weight:bold;">
          Pagar completo →
        </a>
      </div>

      <!-- Opción 2: Cuotas -->
      <div style="border: 1px solid rgba(244,242,236,0.12); background: rgba(244,242,236,0.03); padding: 24px; margin-bottom: 32px;">
        <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: #B8B4AA; text-transform: uppercase; margin: 0 0 6px 0;">Opción 2</p>
        <p style="font-size: 20px; color: #F4F2EC; margin: 0 0 6px 0; font-weight: bold;">Pago en 2 cuotas</p>
        <p style="color: #B8B4AA; margin: 0 0 4px 0; font-size: 14px;">
          Hoy: <strong style="color: #F4F2EC;">$${pagoEnCuotas.montoCuota.toLocaleString('es-AR')} ARS</strong> — acceso inmediato.
        </p>
        <p style="color: #B8B4AA; margin: 0 0 20px 0; font-size: 13px;">
          Segunda cuota: <strong style="color: #F4F2EC;">$${pagoEnCuotas.montoCuota.toLocaleString('es-AR')} ARS</strong> en 30 días (te llegará un email con el link).
        </p>
        <a href="${pagoEnCuotas.initPoint}" style="display:inline-block;background:transparent;color:#C7A36D;padding:12px 28px;font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;border:1px solid rgba(199,163,109,0.4);">
          Pagar primera cuota →
        </a>
      </div>

      <p style="color: #B8B4AA; font-size: 13px; line-height: 1.6;">
        Una vez confirmado el pago recibirás un email con tus credenciales de acceso. 
        Ante cualquier duda, respondé este correo.
      </p>
      <div style="border-top: 1px solid rgba(244,242,236,0.08); margin-top: 32px; padding-top: 20px;">
        <p style="font-family: monospace; font-size: 10px; color: #B8B4AA; text-transform: uppercase; letter-spacing: 0.14em; margin: 0;">${nombreCurso}</p>
      </div>
    </div>
  `
}),

cuota2Reminder: (nombre: string, paymentUrl: string, monto: number, moneda: string, fechaVencimiento: Date) => ({
  subject: 'Recordatorio: Segunda cuota del curso',
  html: `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0B0B0D; color: #F4F2EC; padding: 40px;">
      <div style="border-bottom: 1px solid rgba(199,163,109,0.3); padding-bottom: 24px; margin-bottom: 32px;">
        <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.2em; color: #C7A36D; text-transform: uppercase; margin: 0 0 8px 0;">Poética de la Mirada</p>
        <h1 style="font-size: 24px; color: #F4F2EC; margin: 0; font-weight: normal;">Segunda cuota pendiente</h1>
      </div>
      <p style="color: #B8B4AA; line-height: 1.7; margin-bottom: 24px;">
        Hola <strong style="color: #F4F2EC;">${nombre}</strong>, te recordamos que tu segunda cuota vence el 
        <strong style="color: #C7A36D;">${fechaVencimiento.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
      </p>
      <div style="border: 1px solid rgba(199,163,109,0.4); background: rgba(199,163,109,0.06); padding: 20px; margin-bottom: 28px; text-align: center;">
        <p style="color: #B8B4AA; margin: 0 0 4px 0; font-size: 14px;">Monto a pagar</p>
        <p style="font-size: 32px; font-weight: bold; color: #C7A36D; margin: 0 0 20px 0;">$${monto.toLocaleString('es-AR')} ${moneda}</p>
        <a href="${paymentUrl}" style="display:inline-block;background:#C7A36D;color:#0B0B0D;padding:13px 28px;font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;font-weight:bold;">
          Pagar segunda cuota →
        </a>
      </div>
      <p style="color: #B8B4AA; font-size: 13px;">Si ya realizaste el pago, ignorá este mensaje.</p>
    </div>
  `
}),

accountDisabled: (nombre: string, paymentUrl: string) => ({
  subject: 'Tu acceso al curso fue suspendido',
  html: `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0B0B0D; color: #F4F2EC; padding: 40px;">
      <div style="border-bottom: 1px solid rgba(199,163,109,0.3); padding-bottom: 24px; margin-bottom: 32px;">
        <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.2em; color: #C7A36D; text-transform: uppercase; margin: 0 0 8px 0;">Poética de la Mirada</p>
        <h1 style="font-size: 24px; color: #F4F2EC; margin: 0; font-weight: normal;">Acceso suspendido</h1>
      </div>
      <p style="color: #B8B4AA; line-height: 1.7; margin-bottom: 24px;">
        Hola <strong style="color: #F4F2EC;">${nombre}</strong>, tu acceso al curso fue suspendido temporalmente 
        porque la segunda cuota no fue abonada en el plazo acordado.
      </p>
      <p style="color: #B8B4AA; margin-bottom: 24px;">Para reactivar tu cuenta, realizá el pago:</p>
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${paymentUrl}" style="display:inline-block;background:#C7A36D;color:#0B0B0D;padding:13px 28px;font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;font-weight:bold;">
          Pagar y reactivar acceso →
        </a>
      </div>
      <p style="color: #B8B4AA; font-size: 13px;">Si creés que hay un error, respondé este email.</p>
    </div>
  `
}),
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






export const sendPaymentApprovedWithOptionsEmail = async (
  nombre: string,
  email: string,
  pagoCompleto: { initPoint: string; monto: number },
  pagoEnCuotas: { initPoint: string; montoCuota: number },
  nombreCurso: string
) => {
  const template = emailTemplates.paymentApprovedWithOptions(nombre, pagoCompleto, pagoEnCuotas, nombreCurso);
  return sendEmail(email, template.subject, template.html);
};

export const sendCuota2ReminderEmail = async (
  nombre: string,
  email: string,
  paymentUrl: string,
  monto: number,
  moneda: string,
  fechaVencimiento: Date
) => {
  const template = emailTemplates.cuota2Reminder(nombre, paymentUrl, monto, moneda, fechaVencimiento);
  return sendEmail(email, template.subject, template.html);
};

export const sendAccountDisabledEmail = async (
  nombre: string,
  email: string,
  paymentUrl: string
) => {
  const template = emailTemplates.accountDisabled(nombre, paymentUrl);
  return sendEmail(email, template.subject, template.html);
};