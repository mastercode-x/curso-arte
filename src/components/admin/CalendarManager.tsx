import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, Calendar as CalendarIcon, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as calendarApi from '@/services/calendarApi';
import * as moduleApi from '@/services/moduleApi';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id?: string;
  week: string;
  date: string;
  activity: string;
  module: string | null;
  orden?: number;
}

interface Module {
  id: string;
  titulo: string;
  orden: number;
}

const CalendarManager: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<CalendarEvent>({
    week: '',
    date: '',
    activity: '',
    module: null,
    orden: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [calendarData, modulesData] = await Promise.all([
        calendarApi.getCalendarEvents(),
        moduleApi.getModules(),
      ]);
      setEvents(calendarData || []);
      setModules(modulesData || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({ title: 'Error', description: 'No se pudo cargar el calendario.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData(event);
    } else {
      setEditingEvent(null);
      setFormData({
        week: '',
        date: '',
        activity: '',
        module: null,
        orden: events.length > 0 ? Math.max(...events.map(e => e.orden || 0)) + 1 : 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    setFormData({
      week: '',
      date: '',
      activity: '',
      module: null,
      orden: 0,
    });
  };

  const handleSaveEvent = async () => {
    if (!formData.week || !formData.date || !formData.activity) {
      toast({ title: 'Error', description: 'Por favor completa todos los campos obligatorios.', variant: 'destructive' });
      return;
    }

    try {
      if (editingEvent?.id) {
        // Actualizar evento existente
        await calendarApi.updateCalendarEvent(editingEvent.id, formData);
        setEvents(events.map(e => e.id === editingEvent.id ? { ...formData, id: editingEvent.id } : e));
        toast({ title: 'Éxito', description: 'Evento actualizado correctamente.', duration: 2000 });
      } else {
        // Crear nuevo evento
        const newEvent = await calendarApi.createCalendarEvent(formData);
        setEvents([...events, newEvent]);
        toast({ title: 'Éxito', description: 'Evento creado correctamente.', duration: 2000 });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({ title: 'Error', description: 'No se pudo guardar el evento.', variant: 'destructive', duration: 2000 });
    }
  };

  const handleDeleteEvent = async (eventId?: string) => {
    if (!eventId) return;

    try {
      await calendarApi.deleteCalendarEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      toast({ title: 'Éxito', description: 'Evento eliminado correctamente.', duration: 2000 });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar el evento.', variant: 'destructive', duration: 2000 });
    }
  };

  const handleSaveCalendar = async () => {
    try {
      await calendarApi.updateCalendar({
        events,
        totalWeeks: events.length,
      });
      toast({ title: 'Éxito', description: 'Calendario guardado correctamente.', duration: 2000 });
    } catch (error) {
      console.error('Error saving calendar:', error);
      toast({ title: 'Error', description: 'No se pudo guardar el calendario.', variant: 'destructive', duration: 2000 });
    }
  };

  const getActivityStyle = (activity: string) => {
    if (activity.includes('Encuentro')) {
      return 'bg-[rgba(199,163,109,0.15)] text-[#C7A36D] border-[rgba(199,163,109,0.3)]';
    }
    if (activity.includes('decantación')) {
      return 'bg-[rgba(184,180,170,0.08)] text-[#B8B4AA] border-[rgba(184,180,170,0.15)]';
    }
    return 'bg-[rgba(244,242,236,0.08)] text-[#F4F2EC] border-[rgba(244,242,236,0.15)]';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-serif text-[#F4F2EC] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#C7A36D]" />
            Gestión del Calendario
          </CardTitle>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D] text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar evento
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-[#B8B4AA]">Cargando calendario...</div>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-8 h-8 text-[#B8B4AA] mb-2" />
              <p className="text-[#B8B4AA]">No hay eventos en el calendario</p>
              <p className="text-sm text-[#B8B4AA]/60">Comienza agregando el primer evento</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events
                .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .map((event, index) => (
                  <div
                    key={event.id || index}
                    className="p-4 bg-[rgba(244,242,236,0.03)] border border-[rgba(244,242,236,0.08)] rounded-lg hover:bg-[rgba(244,242,236,0.05)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#C7A36D]">
                            {event.week}
                          </span>
                          <span className="text-xs text-[#B8B4AA]">•</span>
                          <span className="text-sm text-[#B8B4AA] flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {event.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getActivityStyle(event.activity)}`}>
                            <MapPin className="w-3 h-3" />
                            {event.activity}
                          </span>
                          {event.module && (
                            <span className="text-sm text-[#B8B4AA] bg-[rgba(199,163,109,0.1)] px-2 py-1 rounded">
                              {event.module}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDialog(event)}
                          className="p-2 hover:bg-[rgba(199,163,109,0.1)] rounded text-[#B8B4AA] hover:text-[#C7A36D] transition-colors"
                          title="Editar evento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 hover:bg-[rgba(255,0,0,0.1)] rounded text-[#B8B4AA] hover:text-red-400 transition-colors"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <Button
            onClick={handleSaveCalendar}
            disabled={isLoading || events.length === 0}
            className="w-full bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D] mt-4"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar calendario
          </Button>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar evento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#141419] border-[rgba(244,242,236,0.08)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif text-[#F4F2EC]">
              {editingEvent ? 'Editar evento' : 'Crear nuevo evento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="week" className="text-[#F4F2EC]">Semana *</Label>
              <Input
                id="week"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                placeholder="Ej: Semana 1"
                className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]"
              />
            </div>

            <div>
              <Label htmlFor="date" className="text-[#F4F2EC]">Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]",
                      !formData.date && "text-[#B8B4AA]"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(new Date(formData.date), "PPP", { locale: es }) : <span className="text-[#B8B4AA]">Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#141419] border-[rgba(244,242,236,0.08)]">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                    initialFocus
                    locale={es}
                    className="text-[#F4F2EC]"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="activity" className="text-[#F4F2EC]">Actividad *</Label>
              <Input
                id="activity"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                placeholder="Ej: Encuentro virtual"
                className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]"
              />
              <p className="text-xs text-[#B8B4AA] mt-1">
                Sugerencias: "Encuentro virtual", "Tiempo de decantación", "Apertura + presentación"
              </p>
            </div>

            <div>
              <Label htmlFor="module" className="text-[#F4F2EC]">Módulo (opcional)</Label>
              <select
                id="module"
                value={formData.module || ''}
                onChange={(e) => setFormData({ ...formData, module: e.target.value || null })}
                className="w-full px-3 py-2 bg-[rgba(244,242,236,0.03)] border border-[rgba(244,242,236,0.08)] text-[#F4F2EC] rounded-md"
              >
                <option value="">Sin módulo</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.titulo}>
                    Módulo {String(module.orden).padStart(2, '0')} - {module.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="orden" className="text-[#F4F2EC]">Orden</Label>
              <Input
                id="orden"
                type="number"
                value={formData.orden || ''}
                onChange={(e) => setFormData({ ...formData, orden: Number(e.target.value) })}
                placeholder="Ej: 1"
                className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]"
              />
              <p className="text-xs text-[#B8B4AA] mt-1">
                Define el orden en que aparecerá el evento en el calendario.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={handleCloseDialog}
              variant="outline"
              className="border-[rgba(244,242,236,0.08)] text-[#B8B4AA]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEvent}
              className="bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D]"
            >
              {editingEvent ? 'Actualizar' : 'Crear'} evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarManager;
