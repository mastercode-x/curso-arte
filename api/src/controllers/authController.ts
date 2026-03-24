import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Generar tokens
const generateTokens = (userId: string, email: string, rol: string) => {
  const accessToken = jwt.sign(
    { userId, email, rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Generar contraseña temporal legible
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// ── Login ─────────────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña son requeridos' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      estudiante: true,
      profesor: true
    }
  });

  if (!user) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  if (!user.password) {
    res.status(401).json({ error: 'Usuario no tiene contraseña configurada' });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  if (user.estado === 'inactivo') {
    res.status(401).json({ error: 'Usuario inactivo' });
    return;
  }

  if (user.rol === 'estudiante' && user.estudiante) {
    if (user.estudiante.estadoPago !== 'pagado') {
      res.status(403).json({ 
        error: 'Pago requerido',
        message: 'Debes completar el pago para acceder al curso'
      });
      return;
    }
  }

  if (user.rol === 'profesor' && user.profesor) {
    await prisma.profesor.update({
      where: { id: user.profesor.id },
      data: { ultimoLogin: new Date() }
    });
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.rol);

  logger.info(`Login exitoso: ${email}`);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      avatarUrl: user.avatarUrl,
      estudiante: user.estudiante ? {
        id: user.estudiante.id,
        estadoPago: user.estudiante.estadoPago,
        estadoAprobacion: user.estudiante.estadoAprobacion
      } : null,
      profesor: user.profesor ? {
        id: user.profesor.id
      } : null
    }
  });
});

// ── Registro ──────────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, nombre, estudianteId } = req.body;

  if (!email || !password || !nombre || !estudianteId) {
    res.status(400).json({ error: 'Todos los campos son requeridos' });
    return;
  }

  const estudiante = await prisma.estudiante.findUnique({
    where: { id: estudianteId },
    include: { user: true }
  });

  if (!estudiante) {
    res.status(404).json({ error: 'Estudiante no encontrado' });
    return;
  }

  if (estudiante.estadoAprobacion !== 'aprobado') {
    res.status(403).json({ error: 'Solicitud no aprobada' });
    return;
  }

  if (estudiante.estadoPago !== 'pagado') {
    res.status(403).json({ error: 'Pago no completado' });
    return;
  }

  if (estudiante.user.email !== email) {
    res.status(400).json({ error: 'Email no coincide con el registrado' });
    return;
  }

  if (estudiante.user.password) {
    res.status(400).json({ error: 'Usuario ya tiene contraseña configurada' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedUser = await prisma.user.update({
    where: { id: estudiante.userId },
    data: { password: hashedPassword, nombre },
    include: { estudiante: true }
  });

  const { accessToken, refreshToken } = generateTokens(
    updatedUser.id, 
    updatedUser.email, 
    updatedUser.rol
  );

  logger.info(`Registro completado: ${email}`);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      nombre: updatedUser.nombre,
      rol: updatedUser.rol,
      avatarUrl: updatedUser.avatarUrl,
      estudiante: {
        id: estudiante.id,
        estadoPago: estudiante.estadoPago,
        estadoAprobacion: estudiante.estadoAprobacion
      }
    }
  });
});

// ── Forgot Password ───────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email es requerido' });
    return;
  }

  // Siempre responder 200 para no exponer si el email existe (seguridad)
  const successMessage = { message: 'Si el email está registrado, recibirás una nueva contraseña temporal en tu correo.' };

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!user) {
    logger.info(`Forgot password: email no encontrado ${email}`);
    res.json(successMessage);
    return;
  }

  if (user.estado === 'inactivo') {
    res.json(successMessage);
    return;
  }

  // Generar contraseña temporal
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Guardar nueva contraseña
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  // Obtener config SMTP desde la DB o variables de entorno
  let smtpConfig: nodemailer.TransportOptions;

  // Reemplazá el bloque de SMTP por esto:
try {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const frontendUrl = process.env.FRONTEND_URL || 'https://curso-arte.vercel.app';

  await resend.emails.send({
    from: 'Poética de la Mirada <onboarding@resend.dev>',
    to: email,
    subject: 'Tu nueva contraseña temporal — Poética de la Mirada',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#0B0B0D;font-family:Georgia,serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0D;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#141419;border:1px solid rgba(244,242,236,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(244,242,236,0.08);">
                      <p style="margin:0;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#C7A36D;">Poética de la Mirada</p>
                      <h1 style="margin:8px 0 0;font-size:24px;color:#F4F2EC;font-weight:normal;">Recuperación de acceso</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="color:#B8B4AA;font-size:15px;line-height:1.6;margin:0 0 20px;">
                        Hola${user.nombre ? ` <strong style="color:#F4F2EC;">${user.nombre}</strong>` : ''},
                      </p>
                      <p style="color:#B8B4AA;font-size:15px;line-height:1.6;margin:0 0 28px;">
                        Recibimos una solicitud para recuperar el acceso a tu cuenta. Tu nueva contraseña temporal es:
                      </p>
                      <!-- Temp password box -->
                      <div style="background:#0B0B0D;border:1px solid rgba(199,163,109,0.3);padding:20px;text-align:center;margin:0 0 28px;">
                        <p style="margin:0 0 6px;font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#B8B4AA;">Tu contraseña temporal</p>
                        <p style="margin:0;font-family:monospace;font-size:28px;letter-spacing:0.15em;color:#C7A36D;font-weight:bold;">${tempPassword}</p>
                      </div>
                      <p style="color:#B8B4AA;font-size:14px;line-height:1.6;margin:0 0 28px;">
                        Por seguridad, te recomendamos cambiar esta contraseña desde tu perfil después de iniciar sesión.
                      </p>
                      <!-- CTA -->
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#C7A36D;">
                            <a href="${frontendUrl}/#/login" style="display:inline-block;padding:14px 32px;font-family:monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#0B0B0D;text-decoration:none;font-weight:bold;">
                              Iniciar sesión →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid rgba(244,242,236,0.06);">
                      <p style="margin:0;font-family:monospace;font-size:11px;color:rgba(184,180,170,0.5);text-align:center;">
                        Si no solicitaste este cambio, podés ignorar este email. Tu contraseña anterior fue reemplazada.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
  });

  logger.info(`Email de recuperación enviado a: ${email}`);
} catch (emailError) {
  logger.error('Error enviando email de recuperación:', emailError);
}


  res.json(successMessage);
});

// ── Refresh Token ─────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token requerido' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.estado === 'inactivo') {
      res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
      return;
    }

    const tokens = generateTokens(user.id, user.email, user.rol);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

// ── Get Profile ───────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      estudiante: {
        include: {
          progreso: {
            include: { modulo: true }
          }
        }
      },
      profesor: true
    }
  });

  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
    avatarUrl: user.avatarUrl,
    estudiante: user.estudiante ? {
      id: user.estudiante.id,
      estadoPago: user.estudiante.estadoPago,
      estadoAprobacion: user.estudiante.estadoAprobacion,
      fechaPago: user.estudiante.fechaPago,
      fechaInscripcion: user.estudiante.fechaInscripcion,
      progreso: user.estudiante.progreso
    } : null,
    profesor: user.profesor ? {
      id: user.profesor.id
    } : null
  });
});

// ── Update Profile ────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { nombre, avatarUrl, telefono, pais } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { nombre, avatarUrl },
    include: { estudiante: true }
  });

  if (updatedUser.estudiante && (telefono !== undefined || pais !== undefined)) {
    await prisma.estudiante.update({
      where: { id: updatedUser.estudiante.id },
      data: {
        ...(telefono !== undefined && { telefono }),
        ...(pais !== undefined && { pais }),
      }
    });
  }

  res.json({ message: 'Perfil actualizado' });
});

// ── Change Password ───────────────────────────────────────────────
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.password) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);

  if (!isValidPassword) {
    res.status(401).json({ error: 'Contraseña actual incorrecta' });
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  logger.info(`Contraseña cambiada: ${user.email}`);
  res.json({ message: 'Contraseña actualizada exitosamente' });
});