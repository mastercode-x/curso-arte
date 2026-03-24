import { useState, useEffect } from 'react';
import { createPageUrl } from '../utils';
import ThemeToggle from '../components/shared/ThemeToggle';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, BookOpen, CreditCard, UserCheck,
  Settings, LogOut, Bell, TrendingUp, DollarSign, Clock, CheckCircle,
  ChevronRight, Plus, Search, Filter, X, Eye, Check, XCircle,
  Edit, Trash2, Video, FileText, Link, AlignLeft, Image, ExternalLink, BarChart2,
  Calendar, Loader2
} from 'lucide-react';
import * as applicationApi from '../services/applicationApi';
import * as studentApi from '../services/studentApi';
import * as paymentApi from '../services/paymentApi';
import * as moduleApi from '../services/moduleApi';
import * as adminApi from '../services/adminApi';
import * as dashboardApi from '../services/dashboardApi';
import CalendarManager from '../components/admin/CalendarManager';
import SettingsManager from '../components/admin/SettingsManager';
import ModulesManager from '../components/admin/ModulesManager';
import ApplicationsManager from '../components/admin/ApplicationsManager';
import StudentsManager from '../components/admin/StudentsManager';
import PaymentsManager from '../components/admin/PaymentsManager';
import { convertDriveUrl } from '../utils/driveUrl';
import { useAuth } from '@/contexts/AuthContext';

const SECTIONS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'solicitudes', icon: UserCheck, label: 'Solicitudes' },
  { id: 'estudiantes', icon: Users, label: 'Estudiantes' },
  { id: 'modulos', icon: BookOpen, label: 'Módulos' },
  { id: 'calendario', icon: Calendar, label: 'Calendario' },
  { id: 'pagos', icon: CreditCard, label: 'Pagos' },
  { id: 'configuracion', icon: Settings, label: 'Configuración' },
];

export default function ProfessorDashboard() {
  const [section, setSection] = useState<string>(() => {
  return localStorage.getItem('dashboard_section') || 'overview';
});
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showNotif, setShowNotif] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);


  const { logout } = useAuth();
  

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getProfessorDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('Error cargando datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const pendientes = dashboardData?.solicitudesRecientes?.filter((s: any) => s.estado === 'pendiente').length || 0;
  const notifs = [
    { id: 1, text: `${pendientes} solicitudes pendientes de revisión`, time: "Ahora", unread: pendientes > 0 },
    ...(dashboardData?.estudiantesRecientes?.slice(0, 2).map((e: any, i: number) => ({
      id: i + 2,
      text: `${e.nombre} se inscribió al curso`,
      time: "Reciente",
      unread: false
    })) || []),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#141419] border-r border-[rgba(244,242,236,0.08)] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-[rgba(244,242,236,0.08)]">
          <p className="font-serif text-lg text-[#F4F2EC]">Poética de la Mirada</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mt-1">Panel del Profesor</p>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {SECTIONS.map((s: any) => (
            <button
              key={s.id}
              onClick={() => { 
  setSection(s.id); 
  localStorage.setItem('dashboard_section', s.id);
  setSidebarOpen(false); 
}}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded mb-1 transition-colors ${
                section === s.id
                  ? 'bg-[rgba(199,163,109,0.1)] text-[#C7A36D]'
                  : 'text-[#B8B4AA] hover:bg-[rgba(244,242,236,0.03)] hover:text-[#F4F2EC]'
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span className="flex-1 text-sm text-left">{s.label}</span>
              {s.id === 'solicitudes' && pendientes > 0 && (
                <span className="text-[10px] bg-[#C7A36D] text-[#0B0B0D] px-1.5 py-0.5 rounded font-mono">{pendientes}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[rgba(244,242,236,0.08)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(199,163,109,0.2)] flex items-center justify-center text-xs font-serif text-[#C7A36D]">
              {dashboardData?.configuracion?.nombreCurso?.charAt(0) || 'P'}
            </div>
            <div>
              <p className="text-sm text-[#F4F2EC]">Profesor</p>
              <p className="text-xs text-[#B8B4AA]">Admin</p>
            </div>
          </div>
     <button
  onClick={logout}
  className="w-full flex items-center justify-center gap-2 border border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors text-xs py-2.5"
>
  <LogOut className="w-4 h-4" /> Cerrar sesión
</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-[#141419] border-b border-[rgba(244,242,236,0.08)] sticky top-0 z-30 h-16 flex items-center px-6 gap-4">
          <button className="lg:hidden text-[#B8B4AA]" onClick={() => setSidebarOpen(true)}>
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-xl text-[#F4F2EC] flex-1">
            {SECTIONS.find(s => s.id === section)?.label}
          </h1>
          <ThemeToggle />
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="relative text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors p-1">
              <Bell className="w-5 h-5" />
              {pendientes > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-[#C7A36D] rounded-full" />}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#141419] border border-[rgba(244,242,236,0.12)] shadow-xl z-50">
                <div className="p-4 border-b border-[rgba(244,242,236,0.08)] flex justify-between items-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Notificaciones</p>
                  <button onClick={() => setShowNotif(false)}><X className="w-4 h-4 text-[#B8B4AA]" /></button>
                </div>
                {notifs.map(n => (
                  <div key={n.id} className={`p-4 border-b border-[rgba(244,242,236,0.04)] flex gap-3 ${n.unread ? 'bg-[rgba(199,163,109,0.04)]' : ''}`}>
                    {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-[#C7A36D] mt-1.5 shrink-0" />}
                    <div className={n.unread ? '' : 'pl-4'}>
                      <p className="text-sm text-[#F4F2EC] mb-1">{n.text}</p>
                      <p className="text-xs text-[#B8B4AA]">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {section === 'overview' && <OverviewSection data={dashboardData} />}
          {section === 'solicitudes' && <SolicitudesSection />}
          {section === 'estudiantes' && <EstudiantesSection />}
          {section === 'modulos' && <ModulosSection />}
          {section === 'calendario' && <CalendarSection />}
          {section === 'pagos' && <PagosSection />}
          {section === 'configuracion' && <ConfiguracionSection />}
        </div>
      </main>
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────────
function OverviewSection({ data }: { data: any }) {
  const stats = data?.estadisticas || {};
  const moneda = data?.configuracion?.moneda || 'ARS';
  const nombreCurso = data?.configuracion?.nombreCurso || 'Poética de la Mirada';
  const solicitudesPendientes = stats.solicitudesPendientes || 0;

  const hora = new Date().getHours();
  const saludo = hora < 13 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  // Tasa de conversión: aprobados que pagaron
  const tasaConversion = stats.totalEstudiantes > 0
    ? Math.round((stats.estudiantesPagados / stats.totalEstudiantes) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6 sm:p-8">
        {/* Decorative grain */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: '200px' }}
        />
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C7A36D]/60 to-transparent" />

        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C7A36D]/70 mb-2">{saludo}</p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#F4F2EC] leading-tight">{nombreCurso}</h1>
            <p className="text-sm text-[#B8B4AA] mt-1">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {solicitudesPendientes > 0 && (
            <div className="flex items-center gap-3 bg-[rgba(199,163,109,0.08)] border border-[rgba(199,163,109,0.2)] px-4 py-3 shrink-0">
              <div className="w-2 h-2 rounded-full bg-[#C7A36D] animate-pulse" />
              <span className="font-mono text-xs text-[#C7A36D]">
                {solicitudesPendientes} solicitud{solicitudesPendientes > 1 ? 'es' : ''} pendiente{solicitudesPendientes > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Estudiantes activos',
            value: stats.estudiantesPagados || 0,
            sub: `de ${stats.totalEstudiantes || 0} inscriptos`,
            icon: Users,
            accent: '#C7A36D',
            bar: stats.totalEstudiantes > 0 ? (stats.estudiantesPagados / stats.totalEstudiantes) * 100 : 0,
          },
          {
            label: 'Ingresos totales',
            value: `$${(stats.ingresosTotales || 0).toLocaleString('es-AR')}`,
            sub: moneda,
            icon: TrendingUp,
            accent: '#4ade80',
            bar: null,
          },
          {
            label: 'Conversión',
            value: `${tasaConversion}%`,
            sub: 'aprobados que pagaron',
            icon: BarChart2,
            accent: '#60a5fa',
            bar: tasaConversion,
          },
          {
            label: 'Módulos publicados',
            value: stats.modulosPublicados || 0,
            sub: `de ${stats.totalModulos || 0} módulos`,
            icon: BookOpen,
            accent: '#a78bfa',
            bar: stats.totalModulos > 0 ? (stats.modulosPublicados / stats.totalModulos) * 100 : 0,
          },
        ].map(({ label, value, sub, icon: Icon, accent, bar }) => (
          <div key={label} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-5 flex flex-col gap-3 group hover:border-[rgba(244,242,236,0.14)] transition-colors">
            <div className="flex items-start justify-between">
              <div
                className="w-9 h-9 rounded flex items-center justify-center"
                style={{ background: `${accent}18` }}
              >
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#B8B4AA]/50">{label}</span>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl leading-none" style={{ color: accent }}>{value}</p>
              <p className="font-mono text-[10px] text-[#B8B4AA]/60 mt-1">{sub}</p>
            </div>
            {bar !== null && (
              <div className="h-0.5 bg-[rgba(244,242,236,0.05)] rounded-full overflow-hidden mt-auto">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${bar}%`, background: accent }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Middle row: Módulos + Solicitudes ── */}
      <div className="grid lg:grid-cols-5 gap-4">

        {/* Módulos — ocupa 3/5 */}
        <div className="lg:col-span-3 bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Progreso por módulo</p>
            <span className="font-mono text-[9px] text-[#B8B4AA]/50 uppercase tracking-wider">promedio grupal</span>
          </div>
          <div className="space-y-3">
            {data?.progresoPorModulo && data.progresoPorModulo.length > 0 ? (
              data.progresoPorModulo.map((m: any, i: number) => {
                const pct = m.promedioCompletud || 0;
                return (
                  <div key={m.id} className="group">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-mono text-[9px] text-[#C7A36D]/50 shrink-0 w-5 text-right">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-[#F4F2EC] flex-1 truncate">{m.titulo}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.estudiantesActivos > 0 && (
                          <span className="font-mono text-[9px] text-[#B8B4AA]/50">{m.estudiantesActivos} ests.</span>
                        )}
                        <span className="font-mono text-[10px] text-[#C7A36D] w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 shrink-0" />
                      <div className="flex-1 h-1 bg-[rgba(244,242,236,0.05)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: pct === 100
                              ? '#4ade80'
                              : pct > 0
                              ? '#C7A36D'
                              : 'transparent'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen className="w-8 h-8 text-[#B8B4AA]/20 mb-3" />
                <p className="text-sm text-[#B8B4AA]">Aún no hay progreso registrado</p>
                <p className="text-xs text-[#B8B4AA]/50 mt-1">Aparecerá cuando los estudiantes comiencen los módulos</p>
              </div>
            )}
          </div>
        </div>

        {/* Solicitudes pendientes — ocupa 2/5 */}
        <div className="lg:col-span-2 bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Solicitudes recientes</p>
            {solicitudesPendientes > 0 && (
              <span className="font-mono text-[9px] bg-[rgba(199,163,109,0.15)] text-[#C7A36D] px-2 py-0.5 border border-[rgba(199,163,109,0.2)]">
                {solicitudesPendientes} pendientes
              </span>
            )}
          </div>
          <div className="flex-1 space-y-1">
            {data?.solicitudesRecientes && data.solicitudesRecientes.length > 0 ? (
              data.solicitudesRecientes.slice(0, 5).map((s: any, i: number) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[rgba(244,242,236,0.03)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[rgba(199,163,109,0.12)] flex items-center justify-center font-serif text-xs text-[#C7A36D] shrink-0">
                    {s.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#F4F2EC] truncate">{s.nombre}</p>
                    <p className="text-[10px] text-[#B8B4AA]/60 truncate">{s.pais || s.email}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70 shrink-0" title="Pendiente" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <CheckCircle className="w-8 h-8 text-[#B8B4AA]/20 mb-3" />
                <p className="text-sm text-[#B8B4AA]">Todo al día</p>
                <p className="text-xs text-[#B8B4AA]/50 mt-1">No hay solicitudes pendientes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabla de estudiantes ── */}
      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(244,242,236,0.06)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Últimos estudiantes inscriptos</p>
          <span className="font-mono text-[9px] text-[#B8B4AA]/40 uppercase tracking-wider">
            {data?.estudiantesRecientes?.length || 0} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          {data?.estudiantesRecientes && data.estudiantesRecientes.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(244,242,236,0.04)]">
                  {['Estudiante', 'País', 'Estado', 'Inscripción', 'Progreso'].map(h => (
                    <th key={h} className="text-left font-mono text-[9px] uppercase tracking-[0.14em] text-[#B8B4AA]/50 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.estudiantesRecientes.map((e: any) => {
                  const pct = e.progresoPromedio || 0;
                  return (
                    <tr key={e.id} className="border-b border-[rgba(244,242,236,0.03)] hover:bg-[rgba(244,242,236,0.02)] transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[rgba(199,163,109,0.1)] flex items-center justify-center font-serif text-xs text-[#C7A36D] shrink-0">
                            {e.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[#F4F2EC] text-xs">{e.nombre}</p>
                            <p className="text-[10px] text-[#B8B4AA]/50">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#B8B4AA]">{e.pais || '—'}</td>
                      <td className="px-5 py-3.5"><StatusBadge estado={e.estadoPago} /></td>
                      <td className="px-5 py-3.5 text-[10px] text-[#B8B4AA]/60 font-mono">
                        {e.fechaInscripcion ? new Date(e.fechaInscripcion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-1 bg-[rgba(244,242,236,0.05)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: pct === 100 ? '#4ade80' : '#C7A36D'
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-[#B8B4AA]/60 w-7">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-8 h-8 text-[#B8B4AA]/20 mb-3" />
              <p className="text-sm text-[#B8B4AA]">Aún no hay estudiantes inscriptos</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ── SOLICITUDES ────────────────────────────────────────────────────
function SolicitudesSection() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [filter, setFilter] = useState('todas');
  const [selected, setSelected] = useState<null | any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadSolicitudes();
  }, [filter]);

  const loadSolicitudes = async () => {
    try {
      setIsLoading(true);
      const estado = filter === 'todas' ? undefined : filter;
      const [data, statsData] = await Promise.all([
        applicationApi.getApplications({ estado, limit: 50 }),
        applicationApi.getApplicationStats()
      ]);
      setSolicitudes(data.solicitudes || []);
      setStats(statsData);
    } catch (error) {
      toast.error('Error cargando solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await applicationApi.approveApplication(id);
      toast.success('Solicitud aprobada exitosamente');
      loadSolicitudes();
      setSelected(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error aprobando solicitud');
    }
  };

  const handleReject = async (id: string, motivo?: string) => {
    try {
      await applicationApi.rejectApplication(id, motivo);
      toast.success('Solicitud rechazada');
      loadSolicitudes();
      setSelected(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error rechazando solicitud');
    }
  };

  const filtered = filter === 'todas' ? solicitudes : solicitudes.filter((s: any) => s.estado === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {['todas', 'pendiente', 'aprobado', 'rechazado'].map((f: string) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-[10px] uppercase tracking-[0.14em] px-4 py-2 border transition-colors ${
              filter === f
                ? 'border-[#C7A36D] text-[#C7A36D] bg-[rgba(199,163,109,0.08)]'
                : 'border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:border-[rgba(244,242,236,0.2)]'
            }`}
          >
            {f} {f === 'todas' ? `(${solicitudes.length})` : `(${solicitudes.filter(s => s.estado === f).length})`}
          </button>
        ))}
      </div>

      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(244,242,236,0.08)]">
                {["Nombre", "Email", "País", "Fecha", "Estado", "Acciones"].map(h => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.id} className="border-b border-[rgba(244,242,236,0.04)] hover:bg-[rgba(244,242,236,0.02)] transition-colors">
                  <td className="px-5 py-4 text-[#F4F2EC]">{s.nombre}</td>
                  <td className="px-5 py-4 text-[#B8B4AA]">{s.email}</td>
                  <td className="px-5 py-4 text-[#B8B4AA]">{s.pais || '—'}</td>
                  <td className="px-5 py-4 text-[#B8B4AA] text-xs">{new Date(s.fechaSolicitud).toLocaleDateString('es-AR')}</td>
                  <td className="px-5 py-4"><StatusBadge estado={s.estado} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(s)} className="p-1.5 text-[#B8B4AA] hover:text-[#C7A36D] transition-colors"><Eye className="w-4 h-4" /></button>
                      {s.estado === 'pendiente' && (
                        <>
                          <button onClick={() => handleApprove(s.id)} className="p-1.5 text-[#B8B4AA] hover:text-green-400 transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleReject(s.id)} className="p-1.5 text-[#B8B4AA] hover:text-red-400 transition-colors"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#B8B4AA]">No hay solicitudes {filter !== 'todas' ? `en estado "${filter}"` : ''}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
      
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-[rgba(244,242,236,0.08)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[rgba(199,163,109,0.15)] flex items-center justify-center font-serif text-xl text-[#C7A36D]">
            {selected.nombre?.charAt(0)}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C7A36D] mb-1">Solicitud de acceso</p>
            <h2 className="font-serif text-2xl text-[#F4F2EC]">{selected.nombre}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge estado={selected.estado} />
          <button onClick={() => setSelected(null)} className="text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-px bg-[rgba(244,242,236,0.04)] border-b border-[rgba(244,242,236,0.08)]">
        {[
          { label: "Email", value: selected.email },
          { label: "Teléfono", value: selected.telefono || '—' },
          { label: "País", value: selected.pais || '—' },
          { label: "Fecha de solicitud", value: new Date(selected.fechaSolicitud).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#141419] px-6 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-1">{label}</p>
            <p className="text-sm text-[#F4F2EC]">{value}</p>
          </div>
        ))}
      </div>

      {/* Respuestas */}
      <div className="p-6 space-y-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] mb-3 flex items-center gap-2">
            <span className="w-4 h-px bg-[#C7A36D]" />
            Vínculo con el arte
          </p>
          <p className="text-sm text-[#F4F2EC] leading-relaxed bg-[rgba(244,242,236,0.02)] border border-[rgba(244,242,236,0.06)] p-4">
            {selected.experiencia || '—'}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] mb-3 flex items-center gap-2">
            <span className="w-4 h-px bg-[#C7A36D]" />
            Motivación e interés
          </p>
          <p className="text-sm text-[#F4F2EC] leading-relaxed whitespace-pre-wrap bg-[rgba(244,242,236,0.02)] border border-[rgba(244,242,236,0.06)] p-4">
            {selected.interes || '—'}
          </p>
        </div>
      </div>

      {/* Actions */}
      {selected.estado === 'pendiente' && (
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={() => handleApprove(selected.id)}
            className="flex-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <Check className="w-4 h-4" /> Aprobar solicitud
          </button>
          <button
            onClick={() => handleReject(selected.id)}
            className="flex-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <XCircle className="w-4 h-4" /> Rechazar
          </button>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
}

// ── ESTUDIANTES ──────────────────────────────────────────────────
function EstudiantesSection() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<null | any>(null);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      setIsLoading(true);
      const data = await studentApi.getStudents({ limit: 100 });
      setEstudiantes(data.estudiantes || []);
    } catch (error) {
      toast.error('Error cargando estudiantes');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivo = async (id: string) => {
    try {
      await studentApi.toggleStudentActive(id);
      loadEstudiantes();
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error actualizando estado');
    }
  };

  const filtered = estudiantes.filter(e =>
    e.nombre?.toLowerCase().includes(query.toLowerCase()) ||
    e.email?.toLowerCase().includes(query.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8B4AA]" />
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#141419] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] text-sm focus:outline-none focus:border-[#C7A36D] transition-colors"
        />
      </div>

      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(244,242,236,0.08)]">
                {["Estudiante", "País", "Pago", "Inscripción", "Progreso", "Acciones"].map(h => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e: any) => (
                <tr key={e.id} className={`border-b border-[rgba(244,242,236,0.04)] transition-colors ${e.activo !== false ? 'hover:bg-[rgba(244,242,236,0.02)]' : 'opacity-50'}`}>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-[#F4F2EC]">{e.nombre}</p>
                      <p className="text-xs text-[#B8B4AA]">{e.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#B8B4AA]">{e.pais || '—'}</td>
                  <td className="px-5 py-4"><StatusBadge estado={e.estadoPago} /></td>
                  <td className="px-5 py-4 text-xs text-[#B8B4AA]">{e.fechaInscripcion ? new Date(e.fechaInscripcion).toLocaleDateString('es-AR') : '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C7A36D] rounded-full" style={{ width: `${e.progresoPromedio || 0}%` }} />
                      </div>
                     <span className="text-xs text-[#B8B4AA]">{e.progresoPromedio || 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => window.location.href = createPageUrl(`#/estudiantedetalle?id=${e.id}`)} className="p-1.5 text-[#B8B4AA] hover:text-[#C7A36D] transition-colors" title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActivo(e.id)} className={`p-1.5 transition-colors ${e.activo !== false ? 'text-[#B8B4AA] hover:text-yellow-400' : 'text-yellow-400 hover:text-[#B8B4AA]'}`} title={e.activo !== false ? 'Desactivar' : 'Activar'}>
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#B8B4AA]">No se encontraron estudiantes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── MÓDULOS ──────────────────────────────────────────────────────
function ModulosSection() {
  const [modulos, setModulos] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModulos();
  }, []);

  const loadModulos = async () => {
    try {
      setIsLoading(true);
      const data = await moduleApi.getModules();
      setModulos(data || []);
    } catch (error) {
      toast.error('Error cargando módulos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      // Transform form data to match backend schema
      const transformedData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        duracion: formData.duracion,
        estado: formData.estado,
        imagenUrl: formData.imagenUrl || null,
        objetivos: formData.objetivos?.filter((o: string) => o.trim() !== '') || [],
        contenido: formData.contenidos?.map((c: any, index: number) => ({
          tipo: c.tipo,
          titulo: c.titulo,
          url: c.url || null,
          texto: c.texto || null,
          orden: index + 1,
        })) || [],
        ejercicio: formData.ejercicio_titulo ? {
          titulo: formData.ejercicio_titulo,
          descripcion: formData.ejercicio_descripcion || null,
          deadline: formData.ejercicio_deadline || null,
        } : null,
        scheduledPublishAt: formData.scheduledPublishAt || null,
      };

      if (editId) {
        await moduleApi.updateModule(editId, transformedData);
        toast.success('Módulo actualizado');
      } else {
        await moduleApi.createModule(transformedData);
        toast.success('Módulo creado');
      }
      loadModulos();
      setEditId(null);
      setCreating(false);
    } catch (error) {
      toast.error('Error guardando módulo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este módulo?')) return;
    try {
      await moduleApi.deleteModule(id);
      toast.success('Módulo eliminado');
      loadModulos();
    } catch (error) {
      toast.error('Error eliminando módulo');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await moduleApi.toggleModuleStatus(id);
      toast.success('Estado actualizado');
      loadModulos();
    } catch (error) {
      toast.error('Error actualizando estado');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
      </div>
    );
  }

  if (creating || editId) {
    const modulo = editId ? modulos.find(m => m.id === editId) : null;
    return (
      <ModuloEditor
        modulo={modulo}
        onSave={handleSave}
        onCancel={() => { setEditId(null); setCreating(false); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[#B8B4AA] text-sm">{modulos.length} módulos en total</p>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-5 py-2.5 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo módulo
        </button>
      </div>
      <div className="space-y-3">
        {modulos.map((m, i) => (
          <div key={m.id} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-5 flex items-center gap-5 hover:border-[rgba(244,242,236,0.15)] transition-colors">
            <div className="w-12 h-12 bg-[rgba(199,163,109,0.1)] flex items-center justify-center font-serif text-lg text-[#C7A36D] shrink-0">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-[#F4F2EC]">{m.titulo}</p>
              <p className="text-xs text-[#B8B4AA] mt-0.5 line-clamp-1">{m.descripcion}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] font-mono text-[#B8B4AA]">{m.duracion}</span>
                <span className="text-[10px] font-mono text-[#B8B4AA]">· {(m.contenido?.length || 0)} contenidos</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleToggleStatus(m.id)}>
                <StatusBadge estado={m.estado} />
              </button>
              <button onClick={() => setEditId(m.id)} className="p-1.5 text-[#B8B4AA] hover:text-[#C7A36D] transition-colors"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(m.id)} className="p-1.5 text-[#B8B4AA] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {modulos.length === 0 && (
          <p className="text-center text-[#B8B4AA] py-8">No hay módulos creados</p>
        )}
      </div>
    </div>
  );
}




// ── MÓDULO EDITOR ────────────────────────────────────────────────
function ModuloEditor({ modulo, onSave, onCancel }: any) {
  const initialForm = modulo ? {
    titulo: modulo.titulo || '',
    descripcion: modulo.descripcion || '',
    duracion: modulo.duracion || '2 semanas',
    estado: modulo.estado || 'borrador',
    objetivos: modulo.objetivos?.length > 0 ? modulo.objetivos : [''],
    ejercicio_titulo: modulo.ejercicio?.titulo || '',
    ejercicio_descripcion: modulo.ejercicio?.descripcion || '',
    ejercicio_deadline: modulo.ejercicio?.deadline || '',
    contenidos: modulo.contenido || [],
    scheduledPublishAt: modulo.scheduledPublishAt || undefined,
    imagenUrl: modulo.imagenUrl || '',
  } : {
    titulo: '', descripcion: '', duracion: '2 semanas', estado: 'borrador',
    objetivos: [''], ejercicio_titulo: '', ejercicio_descripcion: '',
    ejercicio_deadline: '', contenidos: [], scheduledPublishAt: undefined,
    imagenUrl: '',
  };
 
  const [form, setForm] = useState(initialForm);
 
  // Modo de publicación: 'borrador' | 'publicado' | 'programado'
  const [pubMode, setPubMode] = useState<'borrador' | 'publicado' | 'programado'>(() => {
    if (modulo?.estado === 'publicado') return 'publicado';
    if (modulo?.estado === 'programado') return 'programado';
    return 'borrador';
  });
 
  // Hora mínima en hora LOCAL (no UTC) para el datetime-local input
  const getLocalMin = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
 
  // Convertir fecha UTC guardada → valor para datetime-local (hora local)
  const toLocalInputValue = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
 
  const handlePubModeChange = (mode: 'borrador' | 'publicado' | 'programado') => {
    setPubMode(mode);
    if (mode === 'borrador') {
      setForm(f => ({ ...f, estado: 'borrador', scheduledPublishAt: undefined }));
    } else if (mode === 'publicado') {
      setForm(f => ({ ...f, estado: 'publicado', scheduledPublishAt: undefined }));
    } else {
      setForm(f => ({ ...f, estado: 'programado' }));
    }
  };
 
  const addObjetivo = () => setForm(f => ({ ...f, objetivos: [...(f.objetivos || []), ''] }));
  const updateObjetivo = (i: number, val: string) => setForm(f => { const o = [...(f.objetivos || [])]; o[i] = val; return { ...f, objetivos: o }; });
  const removeObjetivo = (i: number) => setForm(f => ({ ...f, objetivos: f.objetivos.filter((_: any, idx: number) => idx !== i) }));
 
  const addContenido = (tipo: string) => setForm(f => ({
    ...f, contenidos: [...(f.contenidos || []), { tipo, titulo: '', url: '', texto: '', orden: (f.contenidos || []).length + 1 }]
  }));
  const updateContenido = (i: number, key: string, val: string) => setForm(f => {
    const c = [...(f.contenidos || [])]; c[i] = { ...c[i], [key]: val }; return { ...f, contenidos: c };
  });
  const removeContenido = (i: number) => setForm(f => ({ ...f, contenidos: f.contenidos.filter((_: any, idx: number) => idx !== i) }));
 
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#C7A36D] mb-1">{modulo ? 'Editar' : 'Nuevo'} módulo</p>
          <h2 className="font-serif text-2xl text-[#F4F2EC]">{form.titulo || 'Sin título'}</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="font-mono text-xs uppercase tracking-[0.14em] px-5 py-2.5 border border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors">Cancelar</button>
          <button onClick={() => onSave(form)} className="font-mono text-xs uppercase tracking-[0.14em] px-5 py-2.5 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors">Guardar</button>
        </div>
      </div>
 
      <div className="space-y-6 max-w-3xl">
        {/* Información básica */}
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Información básica</p>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Título *</label>
            <input type="text" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors resize-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Duración</label>
            <input type="text" value={form.duracion} onChange={e => setForm({...form, duracion: e.target.value})}
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">URL de la imagen</label>
            <input type="text" value={form.imagenUrl || ''} onChange={e => setForm({...form, imagenUrl: e.target.value})}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
            {form.imagenUrl && (
              <div className="mt-3">
                <img src={form.imagenUrl} alt="Vista previa" className="w-full h-32 object-cover border border-[rgba(244,242,236,0.1)]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>
 
        {/* ── Publicación con radio buttons ── */}
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Publicación</p>
 
          <div className="space-y-2">
            {/* Opción: Borrador */}
            <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${pubMode === 'borrador' ? 'border-[rgba(244,242,236,0.2)] bg-[rgba(244,242,236,0.03)]' : 'border-[rgba(244,242,236,0.06)] hover:border-[rgba(244,242,236,0.1)]'}`}>
              <input type="radio" name="pubMode" value="borrador" checked={pubMode === 'borrador'}
                onChange={() => handlePubModeChange('borrador')}
                className="mt-0.5 accent-[#C7A36D]" />
              <div>
                <p className="text-sm text-[#F4F2EC] font-medium">Borrador</p>
                <p className="text-xs text-[#B8B4AA] mt-0.5">No visible para los estudiantes</p>
              </div>
            </label>
 
            {/* Opción: Publicar ahora */}
            <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${pubMode === 'publicado' ? 'border-[#C7A36D]/40 bg-[rgba(199,163,109,0.05)]' : 'border-[rgba(244,242,236,0.06)] hover:border-[rgba(244,242,236,0.1)]'}`}>
              <input type="radio" name="pubMode" value="publicado" checked={pubMode === 'publicado'}
                onChange={() => handlePubModeChange('publicado')}
                className="mt-0.5 accent-[#C7A36D]" />
              <div>
                <p className="text-sm text-[#F4F2EC] font-medium">Publicar inmediatamente</p>
                <p className="text-xs text-[#B8B4AA] mt-0.5">Visible para estudiantes al guardar</p>
              </div>
            </label>
 
            {/* Opción: Programar */}
            <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${pubMode === 'programado' ? 'border-blue-400/40 bg-blue-400/5' : 'border-[rgba(244,242,236,0.06)] hover:border-[rgba(244,242,236,0.1)]'}`}>
              <input type="radio" name="pubMode" value="programado" checked={pubMode === 'programado'}
                onChange={() => handlePubModeChange('programado')}
                className="mt-0.5 accent-[#C7A36D]" />
              <div className="flex-1">
                <p className="text-sm text-[#F4F2EC] font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Programar publicación
                </p>
                <p className="text-xs text-[#B8B4AA] mt-0.5">Se publicará automáticamente en la fecha elegida</p>
 
                {/* Selector de fecha — solo visible si está seleccionado */}
                {pubMode === 'programado' && (
                  <div className="mt-4 space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">
                      Fecha y hora (hora local)
                    </label>
                    <input
                      type="datetime-local"
                      min={getLocalMin()}
                      value={toLocalInputValue(form.scheduledPublishAt)}
                      onChange={(e) => {
                        // El input entrega hora local, new Date() la interpreta como local → ISO correcto
                        setForm(f => ({
                          ...f,
                          scheduledPublishAt: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        }));
                      }}
                      onClick={(e) => e.stopPropagation()} // evitar que el click propague al label
                      className="bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors w-full"
                    />
                    {form.scheduledPublishAt && (
                      <p className="text-xs text-blue-400 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3" />
                        Se publicará el{' '}
                        {new Date(form.scheduledPublishAt).toLocaleString('es-AR', {
                          weekday: 'long', day: 'numeric', month: 'long',
                          year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    )}
                    {pubMode === 'programado' && !form.scheduledPublishAt && (
                      <p className="text-xs text-yellow-400/80 flex items-center gap-1.5">
                        ⚠ Elegí una fecha para programar la publicación
                      </p>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
 
        {/* Objetivos */}
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Objetivos</p>
            <button onClick={addObjetivo} className="text-[#C7A36D] hover:text-[#d4b07a] transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            {(form.objetivos || []).map((obj: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={obj} onChange={e => updateObjetivo(i, e.target.value)} placeholder={`Objetivo ${i + 1}`}
                  className="flex-1 bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
                <button onClick={() => removeObjetivo(i)} className="p-2.5 text-[#B8B4AA] hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
 
        {/* Ejercicio */}
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Ejercicio</p>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Título</label>
            <input type="text" value={form.ejercicio_titulo || ''} onChange={e => setForm({...form, ejercicio_titulo: e.target.value})}
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Descripción</label>
            <textarea rows={3} value={form.ejercicio_descripcion || ''} onChange={e => setForm({...form, ejercicio_descripcion: e.target.value})}
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors resize-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Fecha límite</label>
            <input type="text" value={form.ejercicio_deadline || ''} onChange={e => setForm({...form, ejercicio_deadline: e.target.value})}
              placeholder="ej: 20 de Octubre 2026"
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
          </div>
        </div>
 
        {/* Contenidos */}
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Contenidos</p>
            <div className="flex gap-2">
              {[
                { tipo: 'video', icon: Video, label: 'Video' },
                { tipo: 'pdf', icon: FileText, label: 'PDF' },
                { tipo: 'texto', icon: AlignLeft, label: 'Texto' },
                { tipo: 'zoom', icon: Link, label: 'Zoom' },
                { tipo: 'imagen', icon: Image, label: 'Imagen' },
              ].map(({ tipo, icon: Icon, label }) => (
                <button key={tipo} onClick={() => addContenido(tipo)}
                  className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5 border border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:text-[#C7A36D] hover:border-[rgba(199,163,109,0.3)] transition-colors">
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {(form.contenidos || []).map((c: any, i: number) => (
              <div key={i} className="border border-[rgba(244,242,236,0.06)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D]">{c.tipo}</span>
                  <button onClick={() => removeContenido(i)} className="text-[#B8B4AA] hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  <input type="text" value={c.titulo} onChange={e => updateContenido(i, 'titulo', e.target.value)} placeholder="Título"
                    className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
                  {['video', 'pdf', 'zoom', 'imagen'].includes(c.tipo) && (
                    <div className="space-y-2">
                      <input type="text" value={c.url} onChange={e => updateContenido(i, 'url', e.target.value)}
                        placeholder={c.tipo === 'imagen' ? 'https://drive.google.com/file/d/FILE_ID/view?usp=sharing' : 'URL'}
                        className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
                      {c.tipo === 'imagen' && c.url && (
                        <div>
                          <img src={convertDriveUrl(c.url)} alt="Preview"
                            className="w-full h-40 object-contain bg-[#0B0B0D] border border-[rgba(244,242,236,0.08)] rounded"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          {convertDriveUrl(c.url) !== c.url && (
                            <p className="mt-1 font-mono text-[10px] text-[#C7A36D]/60">✓ URL de Drive — se convertirá automáticamente al guardar</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {c.tipo === 'texto' && (
                    <textarea rows={4} value={c.texto} onChange={e => updateContenido(i, 'texto', e.target.value)} placeholder="Contenido de texto..."
                      className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors resize-none" />
                  )}
                </div>
              </div>
            ))}
            {(form.contenidos || []).length === 0 && (
              <p className="text-center text-[#B8B4AA] text-sm py-6 border border-dashed border-[rgba(244,242,236,0.06)]">
                Agregá contenido usando los botones de arriba
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





// ── PAGOS ────────────────────────────────────────────────────────
function PagosSection() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPagos();
  }, []);

  const loadPagos = async () => {
    try {
      setIsLoading(true);
      const [pagosData, statsData] = await Promise.all([
        paymentApi.getAllPayments({ limit: 50 }),
        paymentApi.getPaymentStats()
      ]);
      setPagos(pagosData.pagos || []);
      setStats(statsData);
    } catch (error) {
      toast.error('Error cargando pagos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async (id: string) => {
    if (!confirm('¿Estás seguro de reembolsar este pago?')) return;
    try {
      await paymentApi.processRefund(id);
      toast.success('Reembolso procesado');
      loadPagos();
    } catch (error) {
      toast.error('Error procesando reembolso');
    }
  };

  const totalIngresos = stats?.ingresosTotales || 0;
  const moneda = 'ARS';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Ingresos totales", value: `$${totalIngresos.toLocaleString()} ${moneda}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Pagos completados", value: stats?.pagosCompletados || 0, icon: CheckCircle, color: "text-[#C7A36D]", bg: "bg-[rgba(199,163,109,0.1)]" },
          { label: "Pendientes de pago", value: stats?.pagosPendientes || 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-[#B8B4AA]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(244,242,236,0.08)]">
                {["Estudiante", "Monto", "Proveedor", "Referencia", "Estado", "Fecha"].map(h => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagos.map((p: any) => (
                <tr key={p.id} className="border-b border-[rgba(244,242,236,0.04)] hover:bg-[rgba(244,242,236,0.02)] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-[#F4F2EC]">{p.nombre}</p>
                    <p className="text-xs text-[#B8B4AA]">{p.email}</p>
                  </td>
                  <td className="px-5 py-4 text-green-400 font-mono">${p.monto} {p.moneda}</td>
                  <td className="px-5 py-4 text-[#B8B4AA]">{p.proveedor}</td>
                  <td className="px-5 py-4 text-[#B8B4AA] font-mono text-xs">{p.referenciaExterna?.slice(0, 20)}...</td>
                  <td className="px-5 py-4"><StatusBadge estado={p.estado} /></td>
                  <td className="px-5 py-4 text-[#B8B4AA] text-xs">{p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-AR') : '—'}</td>
                </tr>
              ))}
              {pagos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#B8B4AA]">No hay pagos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── CALENDARIO ──────────────────────────────────────────────────
function CalendarSection() {
  return <CalendarManager />;
}

// ── CONFIGURACIÓN ────────────────────────────────────────────────
function ConfiguracionSection() {
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

const loadConfig = async () => {
  try {
    setIsLoading(true);
    const data = await adminApi.getConfig();
    // El backend devuelve { profesorId, configuracion }
    // Solo necesitamos la configuración
    setConfig(data.configuracion || {});
  } catch (error) {
    toast.error('Error cargando configuración');
  } finally {
    setIsLoading(false);
  }
};

  const save = async () => {
    try {
      await adminApi.updateConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error('Error guardando configuración');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">


      {[
        {
          title: "Información del curso",
          fields: [
            { key: "nombreCurso", label: "Nombre del curso", type: "text" },
            { key: "descripcionCurso", label: "Descripción", type: "textarea" },
            { key: "precioCurso", label: "Precio", type: "number" },
            { key: "moneda", label: "Moneda (USD, ARS, etc.)", type: "text" },
            { key: "pais", label: "País", type: "text" },
          ]
        },
        {
          title: "Perfil del profesor",
          fields: [
            { key: "bioProfesor", label: "Bio del Profesor", type: "textarea" },
            { key: "fotoProfesorUrl", label: "URL de Foto del Profesor", type: "url" },
            { key: "emailContacto", label: "Email de contacto", type: "email" },
            { key: "whatsappNumero", label: "WhatsApp (con código de país)", type: "text" },
            { key: "instagramUrl", label: "Instagram URL", type: "url" },
{ key: "facebookUrl", label: "Facebook URL", type: "url" },
          ]
        },
        {
          title: "Links importantes",
          fields: [
            { key: "googleFormUrl", label: "Link del formulario Google", type: "url" },
          ]
        },
      ].map(({ title, fields }: any) => (
        <div key={title} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-5">{title}</p>
          <div className="space-y-4">
            {fields.map(({ key, label, type }: any) => (
              <div key={key}>
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">{label}</label>
                {type === 'textarea' ? (
                  <textarea rows={3} value={config[key] || ''} onChange={e => setConfig({ ...config, [key]: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors resize-none" />
                ) : (
                  <input type={type} value={config[key] || ''} onChange={e => setConfig({ ...config, [key]: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

        

     <div className="flex items-center gap-4">
  <button
    onClick={save}
    className="font-mono text-xs uppercase tracking-[0.14em] px-8 py-3.5 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors"
  >
    Guardar cambios
  </button>
  {saved && (
    <span className="flex items-center gap-2 text-sm text-green-400">
      ✓ Configuración guardada correctamente
    </span>
  )}
</div>
    </div>
  );
}

// ── SHARED ───────────────────────────────────────────────────────
function StatusBadge({ estado }: any) {
  const map: Record<string, string> = {
    pendiente: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    aprobado: 'bg-green-400/10 text-green-400 border-green-400/20',
    rechazado: 'bg-red-400/10 text-red-400 border-red-400/20',
    pagado: 'bg-green-400/10 text-green-400 border-green-400/20',
    no_pagado: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    cancelado: 'bg-red-400/10 text-red-400 border-red-400/20',
    completado: 'bg-green-400/10 text-green-400 border-green-400/20',
    fallido: 'bg-red-400/10 text-red-400 border-red-400/20',
    publicado: 'bg-[rgba(199,163,109,0.15)] text-[#C7A36D] border-[rgba(199,163,109,0.3)]',
    borrador: 'bg-[rgba(244,242,236,0.05)] text-[#B8B4AA] border-[rgba(244,242,236,0.1)]',
    programado: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    reembolsado: 'bg-red-400/10 text-red-400 border-red-400/20',
  };
  const labels: Record<string, string> = {
    no_pagado: 'Sin pago', pendiente: 'Pendiente', aprobado: 'Aprobado',
    rechazado: 'Rechazado', pagado: 'Pagado', cancelado: 'Cancelado',
    completado: 'Completado', fallido: 'Fallido', publicado: 'Publicado',
    borrador: 'Borrador', programado: 'Programado', reembolsado: 'Reembolsado',
  };
  return (
    <span className={`inline-block font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 border ${map[estado] || map.borrador}`}>
      {labels[estado] || estado}
    </span>
  );
}