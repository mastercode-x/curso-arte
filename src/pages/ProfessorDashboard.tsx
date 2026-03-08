import { useState } from 'react';
import { createPageUrl } from '../utils';
import ThemeToggle from '../components/shared/ThemeToggle';
import ApplicationsManager from '../components/admin/ApplicationsManager';
import StudentsManager from '../components/admin/StudentsManager';
import ModulesManager from '../components/admin/ModulesManager';
import PaymentsManager from '../components/admin/PaymentsManager';
import SettingsManager from '../components/admin/SettingsManager';
import { useProfessorDashboard } from '../hooks/useDashboard';
import { useApplicationStats } from '../hooks/useApplications';
import { usePaymentStats } from '../hooks/usePayments';
import {
  LayoutDashboard, Users, BookOpen, CreditCard, UserCheck,
  Settings, LogOut, Bell, TrendingUp, DollarSign, Clock, CheckCircle,
  ChevronRight, X
} from 'lucide-react';

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

  const { dashboard, isLoading: dashboardLoading } = useProfessorDashboard();
  const { stats: appStats } = useApplicationStats();
  const { stats: paymentStats } = usePaymentStats();

  const pendientes = appStats?.pendientes || 0;
  const notifs = [
    { id: 1, text: `${pendientes} solicitudes pendientes de revisión`, time: "Ahora", unread: pendientes > 0 },
    { id: 2, text: "Nuevos pagos recibidos", time: "Hoy", unread: false },
    { id: 3, text: "Sistema funcionando correctamente", time: "Siempre", unread: false },
  ];

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
              P
            </div>
            <div>
              <p className="text-sm text-[#F4F2EC]">Profesor</p>
              <p className="text-xs text-[#B8B4AA]">Administrador</p>
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
          {section === 'overview' && <OverviewSection dashboard={dashboard} dashboardLoading={dashboardLoading} appStats={appStats} paymentStats={paymentStats} />}
          {section === 'solicitudes' && <ApplicationsManager />}
          {section === 'estudiantes' && <StudentsManager />}
          {section === 'modulos' && <ModulesManager />}
          {section === 'pagos' && <PaymentsManager />}
          {section === 'configuracion' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────────
function OverviewSection({ dashboard, dashboardLoading, appStats, paymentStats }: any) {
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#B8B4AA]">Cargando dashboard...</div>
      </div>
    );
  }

  const stats = dashboard?.estadisticas;
  const ingresosTotales = paymentStats?.ingresosTotales || 0;

  const statCards = [
    { label: "Estudiantes activos", value: stats?.totalEstudiantes || 0, icon: Users, color: "text-[#C7A36D]", bg: "bg-[rgba(199,163,109,0.1)]" },
    { label: "Ingresos totales", value: `$${ingresosTotales.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Solicitudes pendientes", value: appStats?.pendientes || 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Módulos publicados", value: stats?.modulosPublicados || 0, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
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
          {dashboard?.progresoPorModulo && dashboard.progresoPorModulo.length > 0 ? (
            <div className="space-y-4">
              {dashboard.progresoPorModulo.slice(0, 5).map((m: any, i: number) => (
                <div key={m.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#F4F2EC] text-xs">{String(i + 1).padStart(2, '0')} — {m.titulo}</span>
                    <span className="font-mono text-xs text-[#C7A36D]">{m.promedioCompletud}%</span>
                  </div>
                  <div className="h-1 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C7A36D] rounded-full" style={{ width: `${m.promedioCompletud}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#B8B4AA] text-sm">No hay datos de progreso disponibles</p>
          )}
        </div>

        <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA] mb-5">Últimas solicitudes</p>
          {dashboard?.solicitudesRecientes && dashboard.solicitudesRecientes.length > 0 ? (
            <div className="space-y-3">
              {dashboard.solicitudesRecientes.slice(0, 4).map((s: any) => (
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
              ))}
            </div>
          ) : (
            <p className="text-[#B8B4AA] text-sm">No hay solicitudes pendientes</p>
          )}
        </div>
      </div>

      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA] mb-5">Estudiantes en curso</p>
        {dashboard?.estudiantesRecientes && dashboard.estudiantesRecientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(244,242,236,0.06)]">
                  {["Nombre", "Email", "Estado pago", "Inscripción"].map(h => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] pb-3 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboard.estudiantesRecientes.map((e: any) => (
                  <tr key={e.id} className="border-b border-[rgba(244,242,236,0.04)] hover:bg-[rgba(244,242,236,0.02)] transition-colors">
                    <td className="py-3 pr-6 text-[#F4F2EC]">{e.nombre}</td>
                    <td className="py-3 pr-6 text-[#B8B4AA]">{e.email}</td>
                    <td className="py-3 pr-6"><StatusBadge estado={e.estadoPago} /></td>
                    <td className="py-3 pr-6 text-[#B8B4AA] text-xs">
                      {e.fechaInscripcion ? new Date(e.fechaInscripcion).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#B8B4AA] text-sm">No hay estudiantes registrados</p>
        )}
      </div>
    </div>
  );
}

// ── SHARED ───────────────────────────────────────────────────────
function StatusBadge({ estado }: { estado: string }) {
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
  };
  const labels: Record<string, string> = {
    no_pagado: 'Sin pago', pendiente: 'Pendiente', aprobado: 'Aprobado',
    rechazado: 'Rechazado', pagado: 'Pagado', cancelado: 'Cancelado',
    completado: 'Completado', fallido: 'Fallido', publicado: 'Publicado',
    borrador: 'Borrador', programado: 'Programado',
  };
  return (
    <span className={`inline-block font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 border ${map[estado] || map.borrador}`}>
      {labels[estado] || estado}
    </span>
  );
}
