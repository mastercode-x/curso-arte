import { api } from './api';

export interface Application {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  pais?: string;
  experiencia?: string;
  interes?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaSolicitud: string;
  fechaRevision?: string;
  motivoRechazo?: string;
}

export interface ApplicationStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  tasaAprobacion: number;
  tasaRechazo: number;
}

// Crear nueva solicitud (público)
export const createApplication = async (data: {
  nombre: string;
  email: string;
  telefono?: string;
  pais?: string;
  experiencia?: string;
  interes?: string;
}) => {
  const response = await api.post('/applications', data);
  return response.data;
};

// Obtener todas las solicitudes (profesor)
export const getApplications = async (params?: {
  estado?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/applications', { params });
  return response.data;
};

// Obtener estadísticas de solicitudes (profesor)
export const getApplicationStats = async (): Promise<ApplicationStats> => {
  const response = await api.get('/applications/stats');
  return response.data;
};

// Obtener detalle de una solicitud (profesor)
export const getApplicationDetail = async (id: string) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

// Aprobar solicitud (profesor)
export const approveApplication = async (id: string) => {
  const response = await api.post(`/applications/${id}/approve`);
  return response.data;
};

// Rechazar solicitud (profesor)
export const rejectApplication = async (id: string, motivo?: string) => {
  const response = await api.post(`/applications/${id}/reject`, { motivo });
  return response.data;
};
