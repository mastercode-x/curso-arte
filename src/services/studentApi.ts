import { api } from './api';

export interface Student {
  id: string;
  nombre: string;
  email: string;
  avatarUrl?: string;
  pais?: string;
  telefono?: string;
  estadoPago: 'pagado' | 'no_pagado' | 'cancelado';
  estadoAprobacion: 'pendiente' | 'aprobado' | 'rechazado';
  fechaInscripcion?: string;
  fechaPago?: string;
  activo: boolean;
}

export interface StudentProgress {
  moduloId: string;
  titulo: string;
  completudPorcentaje: number;
  fechaCompletado?: string;
}

// Obtener todos los estudiantes (profesor)
export const getStudents = async (params?: {
  search?: string;
  estadoPago?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/students', { params });
  return response.data;
};

// Obtener detalle de un estudiante (profesor)
export const getStudentDetail = async (id: string) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

// Obtener progreso de un estudiante (profesor)
export const getStudentProgress = async (id: string) => {
  const response = await api.get(`/students/${id}/progress`);
  return response.data;
};

// Actualizar estado de un estudiante (profesor) - usando endpoint alternativo
export const updateStudentStatus = async (id: string, data: {
  estadoPago?: string;
  activo?: boolean;
}) => {
  // El backend no tiene un endpoint PATCH directo, usamos el detalle y actualizamos
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

// Desactivar/Activar estudiante (profesor) - usando toggle en el backend
export const toggleStudentActive = async (id: string) => {
  // El backend no tiene toggle directo, usamos el detalle
  const student = await getStudentDetail(id);
  const response = await api.put(`/students/${id}`, { 
    estado: student.estado === 'activo' ? 'inactivo' : 'activo' 
  });
  return response.data;
};

// Obtener estadísticas de estudiantes (profesor) - usando dashboard
export const getStudentStats = async () => {
  const response = await api.get('/dashboard/professor');
  return response.data?.estadisticas;
};

// Actualizar perfil del estudiante (estudiante) - usando auth/profile
export const updateStudentProfile = async (data: {
  nombre?: string;
  telefono?: string;
  pais?: string;
  avatarUrl?: string;
}) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

// Cambiar contraseña (estudiante)
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

// Obtener mi dashboard (estudiante)
export const getMyDashboard = async () => {
  const response = await api.get('/students/me/dashboard');
  return response.data;
};

// Obtener mi progreso (estudiante)
export const getMyProgress = async () => {
  const response = await api.get('/students/me/progress');
  return response.data;
};
