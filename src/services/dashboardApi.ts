import { api } from './api';

// Dashboard del profesor
export const getProfessorDashboard = async () => {
  const response = await api.get('/dashboard/professor');
  return response.data;
};

// Dashboard del estudiante
export const getStudentDashboard = async () => {
  const response = await api.get('/dashboard/student');
  return response.data;
};

// Actividad reciente
export const getRecentActivity = async () => {
  const response = await api.get('/dashboard/activity');
  return response.data;
};
