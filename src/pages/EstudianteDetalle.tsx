// @ts-nocheck
import { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, Clock, BookOpen, DollarSign, Mail, Phone, MapPin, Calendar, XCircle, Award } from 'lucide-react';
import * as studentApi from '@/services/studentApi';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';


function StatusBadge({ estado }) {
  const map = {
    pendiente: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    aprobado: 'bg-green-400/10 text-green-400 border-green-400/20',
    rechazado: 'bg-red-400/10 text-red-400 border-red-400/20',
    pagado: 'bg-green-400/10 text-green-400 border-green-400/20',
    no_pagado: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    cancelado: 'bg-red-400/10 text-red-400 border-red-400/20',
    completado: 'bg-green-400/10 text-green-400 border-green-400/20',
    publicado: 'bg-[rgba(199,163,109,0.15)] text-[#C7A36D] border-[rgba(199,163,109,0.3)]',
    borrador: 'bg-[rgba(244,242,236,0.05)] text-[#B8B4AA] border-[rgba(244,242,236,0.1)]',
    activo: 'bg-green-400/10 text-green-400 border-green-400/20',
    inactivo: 'bg-red-400/10 text-red-400 border-red-400/20',
  };
  const labels = {
    no_pagado: 'Sin pago', pendiente: 'Pendiente', aprobado: 'Aprobado',
    rechazado: 'Rechazado', pagado: 'Pagado', cancelado: 'Cancelado',
    completado: 'Completado', publicado: 'Publicado', borrador: 'Borrador',
    activo: 'Activo', inactivo: 'Inactivo',
  };
  return (
    <span className={`inline-block font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 border ${map[estado] || map.borrador}`}>
      {labels[estado] || estado}
    </span>
  );
}

export default function EstudianteDetalle() {
  const { id: paramId } = useParams();
const [searchParams] = useSearchParams();
const id = paramId || searchParams.get('id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstudiante = async () => {
      try {
        const data = await studentApi.getStudentDetail(id);
        setEstudiante(data);
      } catch (error) {
        console.error('Error fetching student:', error);
        toast({ title: 'Error', description: 'No se pudo cargar el detalle del estudiante.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEstudiante();
  }, [id]);

  const updatePago = async (estado) => {
    try {
      await studentApi.updateStudentStatus(id, { estadoPago: estado });
      setEstudiante(prev => ({ ...prev, estadoPago: estado }));
      toast({ title: 'Estado actualizado', description: 'El estado de pago ha sido actualizado.' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
    }
  };

const toggleActivo = async () => {
  try {
    const nuevoEstado = estudiante.estado === 'activo' ? 'inactivo' : 'activo';
    await studentApi.updateStudentStatus(id, { estado: nuevoEstado });
    setEstudiante(prev => ({ ...prev, estado: nuevoEstado }));
    toast({ title: 'Estado actualizado' });
  } catch (error) {
    toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="font-serif text-[#C7A36D] animate-pulse">Cargando perfil...</div>
      </div>
    );
  }

  if (!estudiante) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#B8B4AA] mb-4">Estudiante no encontrado.</p>
          <button onClick={() => navigate('/profesor')}
            className="font-mono text-xs uppercase tracking-[0.14em] text-[#C7A36D] hover:underline">
            ← Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

const progresoEst = estudiante.progreso || [];
const totalPct = progresoEst.length > 0
  ? Math.round(progresoEst.reduce((acc: number, p: any) => acc + (p.completudPorcentaje || 0), 0) / progresoEst.length)
  : 0;
  const pagosEst = estudiante.pagos || [];
  const totalPagado = estudiante.montoPagado || 0;

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* Header */}
      <header className="bg-[#141419] border-b border-[rgba(244,242,236,0.08)] sticky top-0 z-30 h-16 flex items-center px-6 lg:px-8 gap-4">
        <button
          onClick={() => navigate('/profesor')}
          className="flex items-center gap-2 text-[#B8B4AA] hover:text-[#C7A36D] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Volver al dashboard</span>
        </button>
        <div className="w-px h-5 bg-[rgba(244,242,236,0.1)]" />
        <p className="font-serif text-lg text-[#F4F2EC]">{estudiante.nombre}</p>
        <div className="ml-auto flex items-center gap-3">
          <StatusBadge estado={estudiante.estado === 'activo' ? 'activo' : 'inactivo'} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-10 space-y-8">
        {/* Top section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Info card */}
          <div className="lg:col-span-1 bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[rgba(199,163,109,0.15)] flex items-center justify-center font-serif text-2xl text-[#C7A36D]">
                {estudiante.nombre?.charAt(0)}
              </div>
              <div>
                <p className="font-serif text-lg text-[#F4F2EC]">{estudiante.nombre}</p>
                <p className="text-xs text-[#B8B4AA]">Estudiante</p>
              </div>
            </div>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center gap-3 text-[#B8B4AA]">
                <Mail className="w-4 h-4 text-[#C7A36D] shrink-0" />
                <span className="truncate">{estudiante.email}</span>
              </div>
              {estudiante.telefono && (
                <div className="flex items-center gap-3 text-[#B8B4AA]">
                  <Phone className="w-4 h-4 text-[#C7A36D] shrink-0" />
                  <span>{estudiante.telefono}</span>
                </div>
              )}
              {estudiante.pais && (
                <div className="flex items-center gap-3 text-[#B8B4AA]">
                  <MapPin className="w-4 h-4 text-[#C7A36D] shrink-0" />
                  <span>{estudiante.pais}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-[#B8B4AA]">
                <Calendar className="w-4 h-4 text-[#C7A36D] shrink-0" />
                <span>Registrado: {new Date(estudiante.fechaRegistro).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="border-t border-[rgba(244,242,236,0.06)] pt-5 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-3">Acciones</p>
              <button
                onClick={() => updatePago('pagado')}
                className="w-full font-mono text-[10px] uppercase tracking-[0.14em] px-4 py-2.5 bg-green-600/20 border border-green-600/40 text-green-400 hover:bg-green-600/30 transition-colors text-left"
              >✓ Marcar como pagado</button>
              <button
                onClick={() => updatePago('no_pagado')}
                className="w-full font-mono text-[10px] uppercase tracking-[0.14em] px-4 py-2.5 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 transition-colors text-left"
              >⊘ Quitar estado de pago</button>
              <button
  onClick={toggleActivo}
  className={`w-full font-mono text-[10px] uppercase tracking-[0.14em] px-4 py-2.5 border transition-colors text-left ${
    estudiante.estado === 'activo'
      ? 'border-red-400/30 text-red-400 hover:bg-red-400/10'
      : 'border-green-400/30 text-green-400 hover:bg-green-400/10'
  }`}
>
  {estudiante.estado === 'activo' ? '✕ Desactivar acceso' : '✓ Activar acceso'}
</button>
              <a
                href={`mailto:${estudiante.email}`}
                className="w-full inline-block font-mono text-[10px] uppercase tracking-[0.14em] px-4 py-2.5 border border-[rgba(199,163,109,0.3)] text-[#C7A36D] hover:bg-[rgba(199,163,109,0.08)] transition-colors text-center"
              >✉ Enviar email</a>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, label: "Progreso general", value: `${totalPct}%`, color: "text-[#C7A36D]", bg: "bg-[rgba(199,163,109,0.1)]" },
                { icon: CheckCircle, label: "Módulos completados", value: `${progresoEst.filter(p => p.completudPorcentaje === 100).length} / ${progresoEst.length}`, color: "text-green-400", bg: "bg-green-400/10" },
                { icon: DollarSign, label: "Total pagado", value: totalPagado ? `$${totalPagado} ${estudiante.pagos[0]?.moneda || 'USD'}` : '—', color: "text-green-400", bg: "bg-green-400/10" },
                { icon: BookOpen, label: "Estado de pago", value: estudiante.estadoPago === 'pagado' ? 'Pagado' : 'Sin pago', color: estudiante.estadoPago === 'pagado' ? "text-green-400" : "text-yellow-400", bg: estudiante.estadoPago === 'pagado' ? "bg-green-400/10" : "bg-yellow-400/10" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-[#B8B4AA]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall progress bar */}
            <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Progreso del curso</span>
                <span className="font-mono text-xs text-[#C7A36D]">{totalPct}%</span>
              </div>
              <div className="h-2 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
                <div className="h-full bg-[#C7A36D] rounded-full transition-all duration-700" style={{ width: `${totalPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Module progress detail */}
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-6">Progreso por módulo</p>
          <div className="space-y-4">
            {progresoEst.length === 0 ? (
              <p className="text-sm text-[#B8B4AA] text-center py-4">No hay datos de progreso disponibles.</p>
            ) : progresoEst.map((p, i) => {
              const pct = p.completudPorcentaje || 0;
              const done = pct === 100;
              return (
                <div key={p.moduloId} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-mono ${
                    done ? 'bg-[rgba(199,163,109,0.15)] border-[rgba(199,163,109,0.4)] text-[#C7A36D]' : 'border-[rgba(244,242,236,0.1)] text-[#B8B4AA]'
                  }`}>
                    {done ? '✓' : String(p.orden || i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-[#F4F2EC] truncate pr-4">{p.titulo}</span>
                      <span className={`text-xs font-mono shrink-0 ${done ? 'text-[#C7A36D]' : 'text-[#B8B4AA]'}`}>{pct}%</span>
                    </div>
                    <div className="h-1 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${done ? 'bg-[#C7A36D]' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {p.ultimaActividad && (
                    <span className="hidden md:block text-[10px] text-[#B8B4AA] shrink-0 w-24 text-right">
                      {new Date(p.ultimaActividad).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment history */}
        {pagosEst.length > 0 && (
          <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-5">Historial de pagos</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(244,242,236,0.06)]">
                  {["Monto", "Proveedor", "Referencia", "Estado", "Fecha"].map(h => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] pb-3 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagosEst.map(p => (
                  <tr key={p.id} className="border-b border-[rgba(244,242,236,0.04)]">
                    <td className="py-3 pr-6 text-green-400 font-mono">${p.monto} {p.moneda}</td>
                    <td className="py-3 pr-6 text-[#B8B4AA]">{p.proveedor}</td>
                    <td className="py-3 pr-6 font-mono text-[10px] text-[#B8B4AA] truncate max-w-[150px]">{p.referenciaExterna}</td>
                    <td className="py-3 pr-6"><StatusBadge estado={p.estado === 'completado' ? 'pagado' : p.estado} /></td>
                    <td className="py-3 text-[#B8B4AA] text-xs">{p.fechaPago ? new Date(p.fechaPago).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
