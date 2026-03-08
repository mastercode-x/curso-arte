import { api, handleApiError } from './api';
import type { DashboardProfesor, DashboardEstudiante } from '@/types';

interface RecentActivity {
  ultimas24Horas: {
    nuevosEstudiantes: number;
    nuevosPagos: number;
    nuevasSolicitudes: number;
    progresosActualizados: number;
  };
}

export const getProfessorDashboard = async (): Promise<DashboardProfesor> => {
  try {
    const response = await api.get<DashboardProfesor>('/dashboard/professor');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getStudentDashboard = async (): Promise<DashboardEstudiante> => {
  try {
    const response = await api.get<DashboardEstudiante>('/dashboard/student');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getRecentActivity = async (): Promise<RecentActivity> => {
  try {
    const response = await api.get<RecentActivity>('/dashboard/activity');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
