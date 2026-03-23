import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, Eye, GripVertical, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useModules } from '@/hooks/useModules';
import * as moduleApi from '@/services/moduleApi';
import type { Modulo } from '@/types';

const estadoBadge = (modulo: Partial<Modulo>) => {
  if (modulo.estado === 'publicado')
    return <Badge className="bg-green-500/20 text-green-500">Publicado</Badge>;
  if (modulo.estado === 'programado')
    return <Badge className="bg-blue-500/20 text-blue-400">Programado</Badge>;
  return <Badge className="bg-yellow-500/20 text-yellow-500">Borrador</Badge>;
};

const ModulesManager: React.FC = () => {
  const { modules, isLoading, refetch } = useModules();
  const [editingModule, setEditingModule] = useState<Partial<Modulo> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    setEditingModule({
      titulo: '',
      descripcion: '',
      duracion: '2 semanas',
      objetivos: [],
      estado: 'borrador',
      contenido: [],
      recursos: [],
      scheduledPublishAt: undefined,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (modulo: Modulo) => {
    setEditingModule({ ...modulo });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingModule?.titulo) return;

    try {
      // Validar que si estado es 'programado' haya fecha futura
      if (editingModule.estado === 'programado') {
        if (!editingModule.scheduledPublishAt) {
          alert('Debes seleccionar una fecha de publicación programada.');
          return;
        }
        if (new Date(editingModule.scheduledPublishAt) <= new Date()) {
          alert('La fecha de publicación programada debe ser futura.');
          return;
        }
      }

      // Si estado no es programado, limpiar la fecha
      const dataToSave = {
        ...editingModule,
        scheduledPublishAt: editingModule.estado === 'programado'
          ? editingModule.scheduledPublishAt
          : undefined,
      };

      if (editingModule.id) {
        await moduleApi.updateModule(editingModule.id, dataToSave);
      } else {
        await moduleApi.createModule(dataToSave);
      }
      setIsDialogOpen(false);
      setEditingModule(null);
      refetch();
    } catch (error) {
      console.error('Error guardando módulo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este módulo?')) return;
    try {
      await moduleApi.deleteModule(id);
      refetch();
    } catch (error) {
      console.error('Error eliminando módulo:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await moduleApi.duplicateModule(id);
      refetch();
    } catch (error) {
      console.error('Error duplicando módulo:', error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await moduleApi.publishModule(id);
      refetch();
    } catch (error) {
      console.error('Error publicando módulo:', error);
    }
  };

  // Formatea datetime-local a ISO para enviar al backend
  const toISO = (localVal: string) => localVal ? new Date(localVal).toISOString() : undefined;
  // Formatea ISO a datetime-local para el input
  const toLocal = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-serif text-[#F4F2EC]">
              Módulos del curso
            </CardTitle>
            <Button onClick={handleCreate} className="bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D]">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo módulo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#B8B4AA]">Cargando...</div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8 text-[#B8B4AA]">No hay módulos</div>
          ) : (
            <div className="space-y-3">
              {modules.map((modulo, index) => (
                <div
                  key={modulo.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-[rgba(244,242,236,0.03)] border border-[rgba(244,242,236,0.05)]"
                >
                  <div className="text-[#B8B4AA]">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#C7A36D]/10 flex items-center justify-center">
                    <span className="text-sm text-[#C7A36D]">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-[#F4F2EC]">{modulo.titulo}</h3>
                      {estadoBadge(modulo)}
                      {modulo.estado === 'programado' && modulo.scheduledPublishAt && (
                        <span className="flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(modulo.scheduledPublishAt).toLocaleString('es-AR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#B8B4AA] line-clamp-1">{modulo.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {modulo.estado === 'borrador' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePublish(modulo.id)}
                        className="text-green-500"
                        title="Publicar ahora"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(modulo)}
                      className="text-[#B8B4AA]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicate(modulo.id)}
                      className="text-[#B8B4AA]"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(modulo.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#141419] border-[rgba(244,242,236,0.08)] text-[#F4F2EC] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingModule?.id ? 'Editar módulo' : 'Nuevo módulo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#F4F2EC]">Título</Label>
              <Input
                value={editingModule?.titulo || ''}
                onChange={(e) => setEditingModule({ ...editingModule, titulo: e.target.value })}
                className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]"
              />
            </div>
            <div>
              <Label className="text-[#F4F2EC]">Descripción</Label>
              <Textarea
                value={editingModule?.descripcion || ''}
                onChange={(e) => setEditingModule({ ...editingModule, descripcion: e.target.value })}
                className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-[#F4F2EC]">Duración</Label>
              <Input
                value={editingModule?.duracion || ''}
                onChange={(e) => setEditingModule({ ...editingModule, duracion: e.target.value })}
                className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]"
              />
            </div>
            <div>
              <Label className="text-[#F4F2EC]">URL de imagen de portada</Label>
              <Input
                value={editingModule?.imagenUrl || ''}
                onChange={(e) => setEditingModule({ ...editingModule, imagenUrl: e.target.value })}
                placeholder="/images/module01_bg.jpg o URL externa"
                className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]"
              />
            </div>

            {/* Estado de publicación */}
            <div>
              <Label className="text-[#F4F2EC] mb-2 block">Estado de publicación</Label>
              <div className="flex gap-2">
                {(['borrador', 'publicado', 'programado'] as const).map((est) => (
                  <button
                    key={est}
                    type="button"
                    onClick={() => setEditingModule({ ...editingModule, estado: est })}
                    className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider rounded border transition-colors ${
                      editingModule?.estado === est
                        ? est === 'publicado'
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : est === 'programado'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                        : 'bg-transparent border-[rgba(244,242,236,0.08)] text-[#B8B4AA] hover:border-[rgba(244,242,236,0.2)]'
                    }`}
                  >
                    {est === 'borrador' ? 'Borrador' : est === 'publicado' ? 'Publicado' : 'Programado'}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha de publicación programada — solo visible si estado = programado */}
            {editingModule?.estado === 'programado' && (
              <div>
                <Label className="text-[#F4F2EC] mb-1 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Fecha y hora de publicación
                </Label>
                <input
                  type="datetime-local"
                  value={toLocal(editingModule?.scheduledPublishAt as string | undefined)}
                  min={toLocal(new Date().toISOString())}
                  onChange={(e) =>
                    setEditingModule({
                      ...editingModule,
                      scheduledPublishAt: toISO(e.target.value) as any,
                    })
                  }
                  className="w-full bg-[rgba(244,242,236,0.03)] border border-[rgba(244,242,236,0.08)] text-[#F4F2EC] px-3 py-2.5 rounded text-sm focus:outline-none focus:border-blue-400 transition-colors [color-scheme:dark]"
                />
                <p className="text-[10px] text-blue-400/70 mt-1">
                  El módulo se publicará automáticamente en la fecha indicada.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[rgba(244,242,236,0.15)]">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D]">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModulesManager;