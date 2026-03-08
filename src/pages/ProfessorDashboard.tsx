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

const SECTIONS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'solicitudes', icon: UserCheck, label: 'Solicitudes' },
  { id: 'estudiantes', icon: Users, label: 'Estudiantes' },
  { id: 'modulos', icon: BookOpen, label: 'Módulos' },
  { id: 'pagos', icon: CreditCard, label: 'Pagos' },
  { id: 'configuracion', icon: Settings, label: 'Configuración' },
];

export default function ProfessorDashboard() {
  const [section, setSection] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showNotif, setShowNotif] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

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
              onClick={() => { setSection(s.id); setSidebarOpen(false); }}
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
            onClick={() => window.location.href = createPageUrl('Landing')}
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

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {section === 'overview' && <OverviewSection data={dashboardData} />}
          {section === 'solicitudes' && <SolicitudesSection />}
          {section === 'estudiantes' && <EstudiantesSection />}
          {section === 'modulos' && <ModulosSection />}
          {section === 'pagos' && <PagosSection />}
          {section === 'configuracion' && <ConfiguracionSection />}
        </div>
      </main>
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────────
function OverviewSection({ data }: { data: any }) {
  const stats = [
    { label: "Estudiantes activos", value: data?.estadisticas?.estudiantesPagados || 0, icon: Users, color: "text-[#C7A36D]", bg: "bg-[rgba(199,163,109,0.1)]" },
    { label: "Ingresos totales", value: `$${data?.estadisticas?.ingresosTotales?.toLocaleString() || 0} ${data?.configuracion?.moneda || 'ARS'}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Solicitudes pendientes", value: data?.estadisticas?.solicitudesPendientes || 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Módulos publicados", value: data?.estadisticas?.modulosPublicados || 0, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
            <p className="text-xs text-[#B8B4AA]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA] mb-5">Progreso por módulo</p>
          <div className="space-y-4">
            {data?.progresoPorModulo?.slice(0, 5).map((m: any, i: number) => (
              <div key={m.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#F4F2EC] text-xs">{String(i + 1).padStart(2, '0')} — {m.titulo}</span>
                  <span className="font-mono text-xs text-[#C7A36D]">{m.promedioCompletud}%</span>
                </div>
                <div className="h-1 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C7A36D] rounded-full" style={{ width: `${m.promedioCompletud}%` }} />
                </div>
              </div>
            )) || <p className="text-[#B8B4AA] text-sm">No hay datos disponibles</p>}
          </div>
        </div>

        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA] mb-5">Últimas solicitudes</p>
          <div className="space-y-3">
            {data?.solicitudesRecientes?.slice(0, 4).map((s: any) => (
              <div key={s.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[rgba(199,163,109,0.1)] flex items-center justify-center text-xs font-serif text-[#C7A36D]">
                  {s.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F4F2EC] truncate">{s.nombre}</p>
                  <p className="text-xs text-[#B8B4AA]">{s.pais || 'Sin país'}</p>
                </div>
                <StatusBadge estado={s.estado} />
              </div>
            )) || <p className="text-[#B8B4AA] text-sm">No hay solicitudes pendientes</p>}
          </div>
        </div>
      </div>

      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA] mb-5">Estudiantes en curso</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(244,242,236,0.06)]">
                {["Nombre", "País", "Estado pago", "Inscripción", "Progreso"].map(h => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] pb-3 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.estudiantesRecientes?.map((e: any) => (
                <tr key={e.id} className="border-b border-[rgba(244,242,236,0.04)] hover:bg-[rgba(244,242,236,0.02)] transition-colors">
                  <td className="py-3 pr-6 text-[#F4F2EC]">{e.nombre}</td>
                  <td className="py-3 pr-6 text-[#B8B4AA]">{e.pais || '—'}</td>
                  <td className="py-3 pr-6"><StatusBadge estado={e.estadoPago} /></td>
                  <td className="py-3 pr-6 text-[#B8B4AA] text-xs">{e.fechaInscripcion ? new Date(e.fechaInscripcion).toLocaleDateString('es-AR') : '—'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C7A36D]" style={{ width: `${e.progreso || 0}%` }} />
                      </div>
                      <span className="text-xs text-[#B8B4AA]">{e.progreso || 0}%</span>
                    </div>
                  </td>
                </tr>
              )) || <tr><td colSpan={5} className="py-4 text-[#B8B4AA] text-center">No hay estudiantes registrados</td></tr>}
            </tbody>
          </table>
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141419] border border-[rgba(244,242,236,0.12)] w-full max-w-lg p-8 relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-[#B8B4AA] hover:text-[#F4F2EC]"><X className="w-5 h-5" /></button>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C7A36D] mb-2">Solicitud</p>
            <h2 className="font-serif text-2xl text-[#F4F2EC] mb-6">{selected.nombre}</h2>
            <div className="space-y-3 mb-6 text-sm">
              {[["Email", selected.email], ["Teléfono", selected.telefono], ["País", selected.pais]].map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <span className="text-[#B8B4AA] w-24 shrink-0">{k}</span>
                  <span className="text-[#F4F2EC]">{v || '—'}</span>
                </div>
              ))}
              <div>
                <p className="text-[#B8B4AA] mb-1">Experiencia</p>
                <p className="text-[#F4F2EC] text-sm leading-relaxed">{selected.experiencia || '—'}</p>
              </div>
              <div>
                <p className="text-[#B8B4AA] mb-1">Interés</p>
                <p className="text-[#F4F2EC] text-sm leading-relaxed">{selected.interes || '—'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <StatusBadge estado={selected.estado} />
              {selected.estado === 'pendiente' && (
                <>
                  <button
                    onClick={() => handleApprove(selected.id)}
                    className="font-mono text-[10px] uppercase tracking-[0.14em] px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >Aprobar</button>
                  <button
                    onClick={() => handleReject(selected.id)}
                    className="font-mono text-[10px] uppercase tracking-[0.14em] px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                  >Rechazar</button>
                </>
              )}
            </div>
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
                        <div className="h-full bg-[#C7A36D] rounded-full" style={{ width: `${e.progreso || 0}%` }} />
                      </div>
                      <span className="text-xs text-[#B8B4AA]">{e.progreso || 0}%</span>
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
      if (editId) {
        await moduleApi.updateModule(editId, formData);
        toast.success('Módulo actualizado');
      } else {
        await moduleApi.createModule(formData);
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
  const [form, setForm] = useState(modulo || {
    titulo: '', descripcion: '', duracion: '2 semanas', estado: 'borrador',
    objetivos: [''], ejercicio_titulo: '', ejercicio_descripcion: '',
    ejercicio_deadline: '', contenidos: [],
  });

  const [scheduleMode, setScheduleMode] = useState(form.estado === 'programado');
  const minDateTime = new Date().toISOString().slice(0, 16);

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
        </div>

        {/* Publicación */}
        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Publicación</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#F4F2EC]">Publicar inmediatamente</p>
              <p className="text-xs text-[#B8B4AA] mt-0.5">El módulo quedará visible al guardar</p>
            </div>
            <input
              type="checkbox"
              checked={!scheduleMode && form.estado === 'publicado'}
              onChange={(e) => {
                setScheduleMode(false);
                setForm({ ...form, estado: e.target.checked ? 'publicado' : 'borrador' });
              }}
              className="w-4 h-4 accent-[#C7A36D]"
            />
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
            <input type="text" value={form.ejercicio?.titulo || ''} onChange={e => setForm({...form, ejercicio: { ...form.ejercicio, titulo: e.target.value }})}
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Descripción</label>
            <textarea rows={3} value={form.ejercicio?.descripcion || ''} onChange={e => setForm({...form, ejercicio: { ...form.ejercicio, descripcion: e.target.value }})}
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors resize-none" />
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
      setConfig(data);
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
      toast.success('Configuración guardada');
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
      {saved && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✓ Configuración guardada correctamente
        </div>
      )}

      {[
        {
          title: "Información del curso",
          fields: [
            { key: "nombreCurso", label: "Nombre del curso", type: "text" },
            { key: "descripcionCurso", label: "Descripción", type: "textarea" },
            { key: "precioCurso", label: "Precio", type: "number" },
            { key: "moneda", label: "Moneda", type: "text" },
          ]
        },
        {
          title: "Configuración Mercado Pago",
          fields: [
            { key: "mpAccessToken", label: "Access Token", type: "password" },
            { key: "mpPublicKey", label: "Public Key", type: "password" },
          ]
        },
        {
          title: "Configuración Email (SMTP)",
          fields: [
            { key: "smtpHost", label: "Host SMTP", type: "text" },
            { key: "smtpPort", label: "Puerto", type: "number" },
            { key: "smtpUser", label: "Usuario", type: "text" },
            { key: "smtpPass", label: "Contraseña", type: "password" },
            { key: "emailNotificaciones", label: "Email para notificaciones", type: "email" },
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

      <button
        onClick={save}
        className="font-mono text-xs uppercase tracking-[0.14em] px-8 py-3.5 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors"
      >
        Guardar cambios
      </button>
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
