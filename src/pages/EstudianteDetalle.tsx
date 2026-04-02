// @ts-nocheck
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Award,
  CheckCircle, BookOpen, DollarSign, TrendingUp,
  ShieldOff, ShieldCheck, Clock, BarChart2
} from 'lucide-react';
import * as studentApi from '@/services/studentApi';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

function StatusBadge({ estado }) {
  const map = {
    pendiente:  'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    aprobado:   'bg-green-400/10 text-green-400 border-green-400/20',
    rechazado:  'bg-red-400/10 text-red-400 border-red-400/20',
    pagado:     'bg-green-400/10 text-green-400 border-green-400/20',
    no_pagado:  'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    cancelado:  'bg-red-400/10 text-red-400 border-red-400/20',
    completado: 'bg-green-400/10 text-green-400 border-green-400/20',
    activo:     'bg-green-400/10 text-green-400 border-green-400/20',
    inactivo:   'bg-red-400/10 text-red-400 border-red-400/20',
  };
  const labels = {
    no_pagado: 'Sin pago', pendiente: 'Pendiente', aprobado: 'Aprobado',
    rechazado: 'Rechazado', pagado: 'Pagado', cancelado: 'Cancelado',
    completado: 'Completado', activo: 'Activo', inactivo: 'Inactivo',
  };
  return (
    <span className={`inline-block font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 border ${map[estado] || 'bg-[rgba(244,242,236,0.05)] text-[#B8B4AA] border-[rgba(244,242,236,0.1)]'}`}>
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
        toast({ title: 'Error', description: 'No se pudo cargar el detalle del estudiante.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEstudiante();
  }, [id]);

  const toggleActivo = async () => {
    try {
      const nuevoEstado = estudiante.estado === 'activo' ? 'inactivo' : 'activo';
      await studentApi.updateStudentStatus(id, { estado: nuevoEstado });
      setEstudiante(prev => ({ ...prev, estado: nuevoEstado }));
      toast({ title: nuevoEstado === 'activo' ? 'Acceso activado' : 'Acceso desactivado' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="w-8 h-8 border-2 border-[#C7A36D]/30 border-t-[#C7A36D] rounded-full animate-spin mx-auto" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#B8B4AA]">Cargando perfil</p>
        </div>
      </div>
    );
  }

  if (!estudiante) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#B8B4AA] mb-4">Estudiante no encontrado.</p>
          <button onClick={() => navigate('/profesor')} className="font-mono text-xs uppercase tracking-[0.14em] text-[#C7A36D] hover:underline">
            ← Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const progresoEst = estudiante.progreso || [];
  const modulosCompletados = progresoEst.filter(p => p.completudPorcentaje === 100).length;
  const totalPct = progresoEst.length > 0
    ? Math.round(progresoEst.reduce((acc, p) => acc + (p.completudPorcentaje || 0), 0) / progresoEst.length)
    : 0;
  const pagosEst = estudiante.pagos || [];
  const totalPagado = estudiante.montoPagado || 0;
  const moneda = pagosEst[0]?.moneda || 'ARS';
  const activo = estudiante.estado === 'activo';

  return (
    <div className="min-h-screen bg-[#0B0B0D]">

      {/* ── Header ── */}
      <header className="bg-[#141419] border-b border-[rgba(244,242,236,0.08)] sticky top-0 z-30 h-14 flex items-center px-5 lg:px-8 gap-4">
        <button
          onClick={() => navigate('/profesor')}
          className="flex items-center gap-2 text-[#B8B4AA] hover:text-[#C7A36D] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.14em]">Estudiantes</span>
        </button>
        <div className="w-px h-4 bg-[rgba(244,242,236,0.1)]" />
        <p className="font-serif text-base text-[#F4F2EC] flex-1 truncate">{estudiante.nombre}</p>
        <StatusBadge estado={activo ? 'activo' : 'inactivo'} />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Hero card ── */}
        <div className="relative overflow-hidden bg-[#141419] border border-[rgba(244,242,236,0.08)]">
          {/* top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C7A36D]/50 to-transparent" />

          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[rgba(199,163,109,0.3)] to-[rgba(199,163,109,0.08)] flex items-center justify-center font-serif text-3xl text-[#C7A36D] border border-[rgba(199,163,109,0.2)]">
                {estudiante.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#141419] ${activo ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C7A36D]/70 mb-1">Estudiante</p>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#F4F2EC] mb-3">{estudiante.nombre}</h1>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#B8B4AA]">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C7A36D]/60" />
                  {estudiante.email}
                </span>
                {estudiante.telefono && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C7A36D]/60" />
                    {estudiante.telefono}
                  </span>
                )}
                {estudiante.pais && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C7A36D]/60" />
                    {estudiante.pais}
                  </span>
                )}
                {estudiante.fechaRegistro && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C7A36D]/60" />
                    Desde {new Date(estudiante.fechaRegistro).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <a
                href={`mailto:${estudiante.email}`}
                className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-2.5 border border-[rgba(199,163,109,0.3)] text-[#C7A36D] hover:bg-[rgba(199,163,109,0.08)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Enviar email
              </a>
              <button
                onClick={toggleActivo}
                className={`flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-2.5 border transition-colors ${
                  activo
                    ? 'border-red-400/30 text-red-400 hover:bg-red-400/08'
                    : 'border-green-400/30 text-green-400 hover:bg-green-400/08'
                }`}
              >
                {activo
                  ? <><ShieldOff className="w-3.5 h-3.5" /> Desactivar</>
                  : <><ShieldCheck className="w-3.5 h-3.5" /> Activar</>
                }
              </button>

                  <button onClick={() => setConfirmDelete({ id: e.id, nombre: e.nombre })}
                   className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-2.5 border transition-colors border-red-400/30 text-red-400 hover:bg-red-400/08"
                   title="Eliminar estudiante" >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
            </div>
          </div>
        </div>



        {/* Modal de confirmación */}
              {confirmDelete && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] w-full max-w-md p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-400 mb-1">Eliminar estudiante</p>
                        <h3 className="font-serif text-lg text-[#F4F2EC]">{confirmDelete.nombre}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-[#B8B4AA] mb-6 leading-relaxed">
                      Esta acción es <strong className="text-[#F4F2EC]">irreversible</strong>. Se eliminarán el usuario, 
                      su progreso y todos sus registros de pago.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        disabled={isDeleting}
                        className="flex-1 font-mono text-xs uppercase tracking-[0.14em] px-5 py-3 border border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDeleteConfirmed}
                        disabled={isDeleting}
                        className="flex-1 font-mono text-xs uppercase tracking-[0.14em] px-5 py-3 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}





        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Progreso general',
              value: `${totalPct}%`,
              sub: `${modulosCompletados} de ${progresoEst.length} módulos`,
              icon: TrendingUp,
              accent: '#C7A36D',
              bar: totalPct,
            },
            {
              label: 'Módulos completos',
              value: `${modulosCompletados}`,
              sub: `de ${progresoEst.length} publicados`,
              icon: CheckCircle,
              accent: '#4ade80',
              bar: progresoEst.length > 0 ? (modulosCompletados / progresoEst.length) * 100 : 0,
            },
            {
              label: 'Total pagado',
              value: totalPagado ? `$${Number(totalPagado).toLocaleString('es-AR')}` : '—',
              sub: moneda,
              icon: DollarSign,
              accent: '#60a5fa',
              bar: null,
            },
            {
              label: 'Estado de pago',
              value: estudiante.estadoPago === 'pagado' ? 'Pagado' : 'Sin pago',
              sub: estudiante.fechaPago
                ? new Date(estudiante.fechaPago).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—',
              icon: BarChart2,
              accent: estudiante.estadoPago === 'pagado' ? '#4ade80' : '#facc15',
              bar: null,
            },
          ].map(({ label, value, sub, icon: Icon, accent, bar }) => (
            <div
              key={label}
              className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-4 sm:p-5 flex flex-col gap-3 hover:border-[rgba(244,242,236,0.14)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `${accent}18` }}>
                  <Icon className="w-4 h-4" style={{ color: accent }} />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#B8B4AA]/40 text-right leading-tight max-w-[80px]">{label}</span>
              </div>
              <div>
                <p className="font-serif text-2xl leading-none" style={{ color: accent }}>{value}</p>
                <p className="font-mono text-[10px] text-[#B8B4AA]/50 mt-1">{sub}</p>
              </div>
              {bar !== null && (
                <div className="h-0.5 bg-[rgba(244,242,236,0.05)] rounded-full overflow-hidden mt-auto">
                  <div className="h-full rounded-full" style={{ width: `${bar}%`, background: accent }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Progreso por módulo ── */}
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(244,242,236,0.06)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Progreso por módulo</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-mono text-[9px] text-[#B8B4AA]/40">
                <span className="w-2 h-2 rounded-full bg-[#C7A36D]" /> En progreso
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] text-[#B8B4AA]/40">
                <span className="w-2 h-2 rounded-full bg-[#4ade80]" /> Completado
              </span>
            </div>
          </div>
          <div className="p-6">
            {progresoEst.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <BookOpen className="w-8 h-8 text-[#B8B4AA]/20 mb-3" />
                <p className="text-sm text-[#B8B4AA]">Sin datos de progreso aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {progresoEst.map((p, i) => {
                  const pct = p.completudPorcentaje || 0;
                  const done = pct === 100;
                  return (
                    <div key={p.moduloId} className="group">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-mono border transition-colors ${
                          done
                            ? 'bg-[rgba(74,222,128,0.15)] border-[rgba(74,222,128,0.3)] text-green-400'
                            : pct > 0
                            ? 'bg-[rgba(199,163,109,0.1)] border-[rgba(199,163,109,0.25)] text-[#C7A36D]'
                            : 'border-[rgba(244,242,236,0.08)] text-[#B8B4AA]/40'
                        }`}>
                          {done ? '✓' : String(i + 1).padStart(2, '0')}
                        </div>
                        <span className="text-xs text-[#F4F2EC] flex-1 truncate">{p.titulo}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {p.ultimaActividad && (
                            <span className="hidden sm:block font-mono text-[9px] text-[#B8B4AA]/40">
                              {new Date(p.ultimaActividad).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          )}
                          <span className={`font-mono text-[10px] w-7 text-right ${done ? 'text-green-400' : pct > 0 ? 'text-[#C7A36D]' : 'text-[#B8B4AA]/30'}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 shrink-0" />
                        <div className="flex-1 h-1 bg-[rgba(244,242,236,0.04)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: done ? '#4ade80' : pct > 0 ? '#C7A36D' : 'transparent'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Historial de pagos ── */}
        {pagosEst.length > 0 && (
          <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(244,242,236,0.06)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Historial de pagos</p>
              <span className="font-mono text-[9px] text-[#B8B4AA]/40">{pagosEst.length} transacci{pagosEst.length === 1 ? 'ón' : 'ones'}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(244,242,236,0.04)]">
                    {['Monto', 'Proveedor', 'Referencia', 'Estado', 'Fecha'].map(h => (
                      <th key={h} className="text-left font-mono text-[9px] uppercase tracking-[0.14em] text-[#B8B4AA]/40 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagosEst.map(p => (
                    <tr key={p.id} className="border-b border-[rgba(244,242,236,0.03)] hover:bg-[rgba(244,242,236,0.02)] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-green-400 text-sm">${Number(p.monto).toLocaleString('es-AR')} <span className="text-[10px] text-green-400/60">{p.moneda}</span></td>
                      <td className="px-5 py-3.5 text-xs text-[#B8B4AA] capitalize">{p.proveedor}</td>
                      <td className="px-5 py-3.5 font-mono text-[10px] text-[#B8B4AA]/50 max-w-[140px] truncate">{p.referenciaExterna}</td>
                      <td className="px-5 py-3.5"><StatusBadge estado={p.estado === 'completado' ? 'pagado' : p.estado} /></td>
                      <td className="px-5 py-3.5 font-mono text-[10px] text-[#B8B4AA]/60">
                        {p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}