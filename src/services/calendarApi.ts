import { api } from './api';

export interface CalendarEvent {
  id?: string;
  week: string;
  date: string;
  activity: string;
  module: string | null;
  orden?: number;
}

export interface CalendarConfig {
  id?: string;
  profesorId?: string;
  events: CalendarEvent[];
  startDate?: string;
  endDate?: string;
  totalWeeks?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Obtener calendario del profesor
export const getCalendar = async (): Promise<CalendarConfig> => {
  try {
    const response = await api.get('/admin/calendar');
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar:', error);
    // Retornar estructura vacía si no existe
    return { events: [] };
  }
};

// Obtener calendario público (para landing page)
export const getPublicCalendar = async (): Promise<CalendarConfig> => {
  try {
    const response = await api.get('/admin/calendar/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public calendar:', error);
    return { events: [] };
  }
};

// Actualizar calendario del profesor
export const updateCalendar = async (data: CalendarConfig) => {
  const response = await api.put('/admin/calendar', data);
  return response.data;
};

// Crear evento de calendario
export const createCalendarEvent = async (event: CalendarEvent) => {
  const response = await api.post('/admin/calendar/events', event);
  return response.data;
};

// Actualizar evento de calendario
export const updateCalendarEvent = async (eventId: string, event: Partial<CalendarEvent>) => {
  const response = await api.put(`/admin/calendar/events/${eventId}`, event);
  return response.data;
};

// Eliminar evento de calendario
export const deleteCalendarEvent = async (eventId: string) => {
  const response = await api.delete(`/admin/calendar/events/${eventId}`);
  return response.data;
};

// Obtener eventos de calendario
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const config = await getCalendar();
    return config.events || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};
