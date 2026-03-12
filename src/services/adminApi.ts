import { api } from './api';

export interface AdminConfig {
  nombreCurso: string;
  descripcionCurso?: string;
  precioCurso: number;
  moneda: string;
  nombreProfesor?: string;  // Nombre del profesor (del modelo User)
  bioProfesor?: string;     // Solo la biografía
  fotoProfesorUrl?: string;
  emailContacto?: string;
  whatsappNumero?: string;
  pais?: string;
  googleFormUrl?: string;
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

// Respuesta completa del backend para getConfig
export interface ConfigResponse {
  profesorId: string;
  configuracion: AdminConfig | null;
}

// Obtener configuración del profesor
export const getConfig = async (): Promise<ConfigResponse> => {
  const response = await api.get('/admin/config');
  return response.data;
};

// Obtener configuración pública del profesor (para landing page)
export const getPublicConfig = async (): Promise<AdminConfig> => {
  const response = await api.get('/admin/config/public');
  // El endpoint público devuelve { profesorId, configuracion }
  // pero para la landing page necesitamos solo la configuración
  const data = response.data;
  return data.configuracion || data;
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
  const hasEmailConfig = config.configuracion?.smtpHost && config.configuracion?.smtpUser;
  return { valid: hasEmailConfig, config: config.configuracion };
};

// Verificar configuración de Mercado Pago
export const verifyMpConfig = async () => {
  const config = await getConfig();
  const hasMpConfig = config.configuracion?.mpAccessToken && config.configuracion?.mpPublicKey;
  return { valid: hasMpConfig, config: config.configuracion };
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