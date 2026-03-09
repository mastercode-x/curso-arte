import { api } from './api';

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
  titulo: string;       // era 'titulo' ✓ ya estaba bien
  descripcion: string;  // era 'descripcion' ✓ ya estaba bien
  deadline?: string;
};
  recursos?: any[];
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

// Obtener módulos públicos (para landing page)
export const getPublicModules = async () => {
  const response = await api.get('/modules', { params: { public: 'true' } });
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

// Publicar/Despublicar módulo (profesor) - usando publishModule
export const toggleModuleStatus = async (id: string) => {
  const response = await api.post(`/modules/${id}/publish`);
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
export const getModuleByOrder = async (orden: number) => {
  const response = await api.get(`/modules/order/${orden}`);
  return response.data;
};
export const duplicateModule = async (id: string) => {
  const response = await api.post(`/modules/${id}/duplicate`);
  return response.data;
};
export const publishModule = toggleModuleStatus;