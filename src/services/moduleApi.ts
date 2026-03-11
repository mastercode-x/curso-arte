import { api, publicApi } from './api';

export interface Module {
  id: string;
  titulo: string;
  descripcion?: string;
  orden: number;
  estado: 'borrador' | 'publicado' | 'programado';
  duracion?: string;
  objetivos: string[];
  contenido?: any;
  ejercicio?: {
    titulo: string;
    descripcion: string;
    deadline?: string;
  };
  recursos?: any[];
  imagenUrl?: string;
  scheduledPublishAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleProgress {
  moduloId: string;
  completudPorcentaje: number;
  fechaCompletado?: string;
  ultimaActividad?: string;
}

// Obtener todos los módulos (autenticado)
export const getModules = async () => {
  const response = await api.get('/modules');
  return response.data;
};

// Obtener módulos públicos (para landing page) - sin autenticación
export const getPublicModules = async () => {
  const response = await publicApi.get('/modules/public');
  return response.data;
};

// Obtener un módulo por ID (estudiante/profesor)
export const getModule = async (id: string) => {
  const response = await api.get(`/modules/${id}`);
  return response.data;
};

// Crear módulo (profesor)
export const createModule = async (data: Partial<Module>) => {
  const response = await api.post('/modules', data);
  return response.data;
};

// Actualizar módulo (profesor)
export const updateModule = async (id: string, data: Partial<Module>) => {
  const response = await api.put(`/modules/${id}`, data);
  return response.data;
};

// Eliminar módulo (profesor)
export const deleteModule = async (id: string) => {
  const response = await api.delete(`/modules/${id}`);
  return response.data;
};

// Publicar/Despublicar módulo (profesor)
export const toggleModuleStatus = async (id: string, despublicar: boolean = false) => {
  const response = await api.post(`/modules/${id}/publish`, { despublicar });
  return response.data;
};

// Programar publicación de módulo (profesor)
export const scheduleModulePublish = async (id: string, scheduledPublishAt: string) => {
  const response = await api.post(`/modules/${id}/schedule`, { scheduledPublishAt });
  return response.data;
};

// Actualizar progreso del estudiante (estudiante)
export const updateModuleProgress = async (moduleId: string, data: {
  completudPorcentaje: number;
  completado?: boolean;
}) => {
  if (data.completado) {
    const response = await api.post(`/students/me/progress/${moduleId}/complete`);
    return response.data;
  }
  const response = await api.post(`/students/me/progress/${moduleId}`, {
    completudPorcentaje: data.completudPorcentaje
  });
  return response.data;
};

// Obtener progreso del estudiante actual (estudiante)
export const getMyProgress = async () => {
  const response = await api.get('/students/me/progress');
  return response.data;
};

// Obtener estadísticas de módulos (profesor)
export const getModuleStats = async () => {
  const response = await api.get('/modules/stats');
  return response.data;
};


// Alias para compatibilidad
export const getModuleById = getModule;

// CORREGIDO: URL correcta para obtener módulo por orden
export const getModuleByOrder = async (orden: number) => {
  const response = await api.get(`/modules/by-order/${orden}`);
  return response.data;
};

export const duplicateModule = async (id: string) => {
  const response = await api.post(`/modules/${id}/duplicate`);
  return response.data;
};

export const publishModule = toggleModuleStatus;