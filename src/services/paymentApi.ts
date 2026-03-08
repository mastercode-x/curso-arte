import { api } from './api';

export interface Payment {
  id: string;
  estudianteId: string;
  nombre?: string;
  email?: string;
  monto: number;
  moneda: string;
  proveedor: string;
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  fechaPago?: string;
  createdAt: string;
}

export interface PaymentStats {
  totalPagos: number;
  pagosCompletados: number;
  pagosPendientes: number;
  pagosReembolsados: number;
  ingresosTotales: number;
}

export interface CoursePrice {
  precio: number;
  moneda: string;
}

// Crear sesión de pago (estudiante)
export const createPaymentSession = async () => {
  const response = await api.post('/payments/create-session');
  return response.data;
};

// Verificar estado de pago
export const checkPaymentStatus = async (sessionId: string) => {
  const response = await api.get(`/payments/status/${sessionId}`);
  return response.data;
};

// Obtener mis pagos (estudiante)
export const getMyPayments = async (): Promise<Payment[]> => {
  const response = await api.get('/payments/my-payments');
  return response.data;
};

// Obtener todos los pagos (profesor)
export const getAllPayments = async (params?: {
  estado?: string;
  page?: number;
  limit?: number;
}): Promise<{ pagos: Payment[]; pagination: any }> => {
  const response = await api.get('/payments', { params });
  return response.data;
};

// Obtener estadísticas de pagos (profesor)
export const getPaymentStats = async (): Promise<PaymentStats> => {
  const response = await api.get('/payments/stats');
  return response.data;
};

// Procesar reembolso (profesor)
export const processRefund = async (paymentId: string) => {
  const response = await api.post(`/payments/refund/${paymentId}`);
  return response.data;
};

// Configurar precio del curso (profesor)
export const setCoursePrice = async (precio: number, moneda: string = 'ARS') => {
  const response = await api.post('/payments/price', { precio, moneda });
  return response.data;
};

// Obtener precio del curso (público)
export const getCoursePrice = async (): Promise<CoursePrice> => {
  const response = await api.get('/payments/price');
  return response.data;
};
