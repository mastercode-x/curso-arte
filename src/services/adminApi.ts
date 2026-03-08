import { api } from './api';

export interface AdminConfig {
  nombreCurso: string;
  descripcionCurso?: string;
  precioCurso: number;
  moneda: string;
  bioProfesor?: string;
  fotoProfesorUrl?: string;
  emailContacto?: string;
  whatsappNumero?: string;
  pais?: string;
  mpAccessToken?: string;
  mpPublicKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  emailNotificaciones?: string;
  notificarWhatsApp: boolean;
  notificarEmail: boolean;
  
}

// Obtener configuración del profesor
export const getConfig = async (): Promise<AdminConfig> => {
  const response = await api.get('/admin/config');
  return response.data;
};

// Actualizar configuración del profesor
export const updateConfig = async (data: Partial<AdminConfig>) => {
  const response = await api.put('/admin/config', data);
  return response.data;
};

// Configurar credenciales de Mercado Pago
export const setMPKeys = async (mpAccessToken: string, mpPublicKey: string) => {
  const response = await api.post('/admin/mp-keys', { mpAccessToken, mpPublicKey });
  return response.data;
};

// Verificar configuración de email - usando un endpoint alternativo
export const verifyEmailConfig = async () => {
  // El backend no tiene este endpoint directo, verificamos a través de la config
  const config = await getConfig();
  const hasEmailConfig = config.smtpHost && config.smtpUser;
  return { valid: hasEmailConfig, config };
};

// Verificar configuración de Mercado Pago
export const verifyMpConfig = async () => {
  const config = await getConfig();
  const hasMpConfig = config.mpAccessToken && config.mpPublicKey;
  return { valid: hasMpConfig, config };
};

// Obtener estadísticas generales
export const getGeneralStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Obtener resumen del dashboard
export const getDashboardSummary = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// Enviar email de prueba - no disponible en backend actual
export const sendTestEmail = async (email: string) => {
  // Esta funcionalidad no está implementada en el backend actual
  throw new Error('Funcionalidad no disponible');
};


export const getProfessorDashboard = getDashboardSummary;
export const setStripeKeys = setMPKeys; // alias por compatibilidad