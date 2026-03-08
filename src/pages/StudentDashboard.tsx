import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useStudentDashboard } from '../hooks/useDashboard';
import { useModules } from '../hooks/useModules';
import { useAuth } from '../hooks/useAuth';
import * as studentApi from '../services/studentApi';
import {
  BookOpen, CheckCircle, Clock, Play, Award, LogOut, User, ChevronRight, Lock, Settings, X, Bell, Star, Loader2
} from 'lucide-react';

export default function StudentDashboard() {
  const { dashboard, isLoading: dashboardLoading, refetch } = useStudentDashboard();
  const { modules, isLoading: modulesLoading } = useModules('publicado');
  const { user, logout } = useAuth();
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);

  const notifications = [
    { id: 1, text: "Bienvenido al curso Poética de la Mirada", time: "Ahora", read: false },
    { id: 2, text: "Completa tu perfil para personalizar tu experiencia", time: "Hoy", read: false },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Calcular progreso
  const modulosConProgreso = modules.map(m => {
    const progreso = dashboard?.modulos?.find((p: any) => p.id === m.id);
    return {
      ...m,
      progress: progreso ? { completado: progreso.estado === 'completado', porcentaje: progreso.progreso } : null
    };
  });

  const completados = modulosConProgreso.filter(m => m.progress?.completado).length;
  const totalModulos = modules.length;
  const totalProgress = totalModulos > 0 ? Math.round((completados / totalModulos) * 100) : 0;
  const moduloActual = modulosConProgreso.find(m => !m.progress?.completado);
  const allCompleted = completados === totalModulos && totalModulos > 0;

  const handleMarkComplete = async (moduloId: string) => {
    setMarkingComplete(moduloId);
    try {
      await studentApi.markModuleComplete(moduloId);
      refetch();
    } catch (error) {
      console.error('Error marcando módulo como completado:', error);
    } finally {
      setMarkingComplete(null);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = createPageUrl('Landing');
  };

  if (dashboardLoading || modulesLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#B8B4AA]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando tu dashboard...</span>
        </div>
      </div>
    );
  }

  if (activeModuleId) {
    const modulo = modules.find(m => m.id === activeModuleId);
    if (!modulo) return null;
    return (
      <ModuleViewer 
        modulo={modulo} 
        moduleIndex={modules.findIndex(m => m.id === activeModuleId)}
        onBack={() => setActiveModuleId(null)}
        onMarkComplete={() => handleMarkComplete(activeModuleId)}
        markingComplete={markingComplete === activeModuleId}
      />
    );
  }

  const me = dashboard?.perfil || { nombre: user?.nombre || 'Estudiante', email: user?.email || '' };

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* Header */}
      <header className="bg-[#141419] border-b border-[rgba(244,242,236,0.08)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <span className="font-serif text-lg text-[#F4F2EC]">Poética de la Mirada</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative p-2 text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#C7A36D] rounded-full" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#141419] border border-[rgba(244,242,236,0.12)] shadow-xl z-50">
                  <div className="p-4 border-b border-[rgba(244,242,236,0.08)] flex justify-between items-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Notificaciones</p>
                    <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-[#B8B4AA]" /></button>
                  </div>
                  <div>
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 border-b border-[rgba(244,242,236,0.04)] ${!n.read ? 'bg-[rgba(199,163,109,0.04)]' : ''}`}>
                        <div className="flex gap-3">
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#C7A36D] mt-1.5 shrink-0" />}
                          <div className={n.read ? 'pl-4' : ''}>
                            <p className="text-sm text-[#F4F2EC] mb-1">{n.text}</p>
                            <p className="text-xs text-[#B8B4AA]">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 hover:bg-[rgba(244,242,236,0.05)] transition-colors rounded"
              >
                <div className="w-7 h-7 rounded-full bg-[rgba(199,163,109,0.2)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#C7A36D]" />
                </div>
                <span className="hidden md:block text-sm text-[#B8B4AA]">{me.nombre}</span>
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#141419] border border-[rgba(244,242,236,0.12)] shadow-xl z-50">
                  <div className="p-4 border-b border-[rgba(244,242,236,0.08)]">
                    <p className="text-sm text-[#F4F2EC]">{me.nombre}</p>
                    <p className="text-xs text-[#B8B4AA]">{me.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { setShowProfile(false); document.getElementById('perfil-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#B8B4AA] hover:text-[#C7A36D] hover:bg-[rgba(199,163,109,0.05)] transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Editar perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#B8B4AA] hover:text-red-400 hover:bg-red-400/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10" onClick={() => { setShowNotifications(false); setShowProfile(false); }}>
        {/* Welcome */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C7A36D] mb-2">Bienvenida de vuelta</p>
            <h1 className="font-serif text-3xl text-[#F4F2EC]">{me.nombre}</h1>
          </div>
          {moduloActual && (
            <button
              onClick={() => setActiveModuleId(moduloActual.id)}
              className="flex items-center gap-3 px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-[0.14em]">Continuar: {moduloActual.titulo}</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Award, label: "Progreso general", value: `${totalProgress}%`, color: "text-[#C7A36D]", bg: "bg-[rgba(199,163,109,0.1)]" },
            { icon: CheckCircle, label: "Completados", value: completados, color: "text-green-400", bg: "bg-green-400/10" },
            { icon: Clock, label: "En progreso", value: modulosConProgreso.filter(m => m.progress && !m.progress.completado).length, color: "text-blue-400", bg: "bg-blue-400/10" },
            { icon: BookOpen, label: "Total módulos", value: totalModulos, color: "text-[#C7A36D]", bg: "bg-[rgba(199,163,109,0.1)]" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-[#B8B4AA]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-10 bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA]">Progreso del curso</span>
            <span className="font-mono text-xs text-[#C7A36D]">{completados} / {totalModulos} módulos</span>
          </div>
          <div className="h-1.5 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C7A36D] rounded-full transition-all duration-700"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Modules */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-[#F4F2EC] mb-6">Módulos del curso</h2>
          {totalModulos === 0 ? (
            <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-8 text-center">
              <p className="text-[#B8B4AA]">Los módulos del curso estarán disponibles pronto.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modulosConProgreso.map((m, i) => {
                const prog = m.progress;
                const isCompleted = prog?.completado;
                const isInProgress = prog && !prog.completado;
                const isLocked = i > 0 && !modulosConProgreso[i - 1]?.progress?.completado && !isCompleted && !isInProgress;

                return (
                  <div
                    key={m.id}
                    className={`group flex items-center gap-5 p-5 border transition-all duration-200 cursor-pointer ${
                      isLocked
                        ? 'border-[rgba(244,242,236,0.04)] opacity-50 cursor-not-allowed'
                        : 'border-[rgba(244,242,236,0.08)] hover:border-[rgba(199,163,109,0.3)] hover:bg-[rgba(199,163,109,0.03)]'
                    }`}
                    onClick={() => !isLocked && setActiveModuleId(m.id)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                      isCompleted ? 'bg-[rgba(199,163,109,0.15)] border-[rgba(199,163,109,0.4)]' :
                      isInProgress ? 'bg-blue-400/10 border-blue-400/30' :
                      'bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.1)]'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5 text-[#C7A36D]" /> :
                       isLocked ? <Lock className="w-4 h-4 text-[#B8B4AA]" /> :
                       <Play className="w-4 h-4 text-[#B8B4AA]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] opacity-70">
                          {String(i + 1).padStart(2, '0')}
                        </p>
                        {isCompleted && <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] bg-[rgba(199,163,109,0.1)] px-2 py-0.5">Completado</span>}
                        {isInProgress && <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-blue-400 bg-blue-400/10 px-2 py-0.5">En progreso</span>}
                      </div>
                      <h3 className="font-serif text-lg text-[#F4F2EC] group-hover:text-[#C7A36D] transition-colors">{m.titulo}</h3>
                      <p className="text-sm text-[#B8B4AA] mt-1 line-clamp-1">{m.descripcion}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-[#B8B4AA]">{m.duracion}</p>
                        {prog && !isCompleted && (
                          <p className="text-xs text-blue-400">{prog.porcentaje}% completado</p>
                        )}
                      </div>
                      {prog && !isCompleted && (
                        <div className="w-20 h-1 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${prog.porcentaje}%` }} />
                        </div>
                      )}
                      {!isLocked && <ChevronRight className="w-4 h-4 text-[#B8B4AA] group-hover:text-[#C7A36D] transition-colors" />}
                    </div>
                  </div>
                );
              })}

              {/* Certificate row */}
              <div className={`flex items-center gap-5 p-5 border transition-all duration-200 ${
                allCompleted
                  ? 'border-[rgba(199,163,109,0.4)] bg-[rgba(199,163,109,0.06)] cursor-pointer hover:bg-[rgba(199,163,109,0.1)]'
                  : 'border-[rgba(244,242,236,0.04)] opacity-40 cursor-not-allowed'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  allCompleted ? 'bg-[rgba(199,163,109,0.2)] border-[#C7A36D]' : 'bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.1)]'
                }`}>
                  <Star className={`w-5 h-5 ${allCompleted ? 'text-[#C7A36D]' : 'text-[#B8B4AA]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] opacity-70">
                      Certificado
                    </p>
                    {allCompleted && <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] bg-[rgba(199,163,109,0.1)] px-2 py-0.5">Desbloqueado</span>}
                  </div>
                  <h3 className={`font-serif text-lg ${allCompleted ? 'text-[#C7A36D]' : 'text-[#F4F2EC]'}`}>
                    Certificado de finalización
                  </h3>
                  <p className="text-sm text-[#B8B4AA] mt-1">
                    {allCompleted
                      ? 'Completaste el curso. Podés descargar tu certificado.'
                      : `Completá los ${totalModulos} módulos para desbloquear el certificado.`}
                  </p>
                </div>
                {allCompleted && (
                  <button className="font-mono text-[10px] uppercase tracking-[0.14em] px-5 py-2.5 border border-[#C7A36D] text-[#C7A36D] hover:bg-[rgba(199,163,109,0.1)] transition-colors">
                    Descargar
                  </button>
                )}
                {!allCompleted && <Lock className="w-4 h-4 text-[#B8B4AA]" />}
              </div>
            </div>
          )}
        </div>

        {/* Profile settings */}
        <div id="perfil-section" className="mb-10">
          <h2 className="font-serif text-2xl text-[#F4F2EC] mb-6">Mi perfil</h2>
          <ProfileEditor me={me} />
        </div>
      </main>
    </div>
  );
}

// ── Profile Editor ────────────────────────────────────────────────
function ProfileEditor({ me }: { me: any }) {
  const [form, setForm] = useState(me);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { updateProfile } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ nombre: form.nombre });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6 max-w-2xl">
      {saved && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✓ Perfil actualizado
        </div>
      )}
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-5">Datos personales</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          { key: 'nombre', label: 'Nombre completo', type: 'text' },
          { key: 'email', label: 'Email', type: 'email', disabled: true },
        ].map(({ key, label, type, disabled }) => (
          <div key={key}>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">{label}</label>
            <input
              type={type}
              value={form[key] || ''}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              disabled={disabled}
              className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors disabled:opacity-50"
            />
          </div>
        ))}
      </div>
      <button 
        type="submit"
        disabled={saving}
        className="font-mono text-xs uppercase tracking-[0.14em] px-8 py-3.5 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}

// ── Module Viewer ─────────────────────────────────────────────────
function ModuleViewer({ 
  modulo, 
  moduleIndex, 
  onBack, 
  onMarkComplete,
  markingComplete 
}: { 
  modulo: any; 
  moduleIndex: number; 
  onBack: () => void; 
  onMarkComplete: () => void;
  markingComplete: boolean;
}) {
  const [activeContentIdx, setActiveContentIdx] = useState(0);
  const contenidos = (modulo.contenido as any[]) || [];
  const active = contenidos[activeContentIdx];

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex overflow-hidden">
      <aside className="hidden lg:flex flex-col w-72 bg-[#141419] border-r border-[rgba(244,242,236,0.08)] fixed top-0 bottom-0 left-0 overflow-y-auto">
        <div className="p-6 border-b border-[rgba(244,242,236,0.08)]">
          <button onClick={onBack} className="flex items-center gap-2 text-[#B8B4AA] hover:text-[#C7A36D] transition-colors text-sm mb-4">
            ← Volver
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] mb-1">Módulo {moduleIndex + 1}</p>
          <h2 className="font-serif text-lg text-[#F4F2EC] leading-tight">{modulo.titulo}</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {contenidos.map((c, i) => (
            <button key={i} onClick={() => setActiveContentIdx(i)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded mb-1 transition-colors ${
                i === activeContentIdx ? 'bg-[rgba(199,163,109,0.1)] text-[#C7A36D]' : 'text-[#B8B4AA] hover:text-[#F4F2EC] hover:bg-[rgba(244,242,236,0.03)]'
              }`}>
              <span className="font-mono text-[10px] w-5 opacity-60">{ContentIcon(c.type)}</span>
              <span className="text-sm">{c.title || c.titulo}</span>
            </button>
          ))}
          {contenidos.length === 0 && <p className="text-[#B8B4AA] text-sm px-2 py-4">Sin contenido aún.</p>}
        </nav>
      </aside>
      <main className="flex-1 lg:ml-72 overflow-y-auto" style={{ height: '100vh' }}>
        <div className="lg:hidden p-4 border-b border-[rgba(244,242,236,0.08)] flex items-center gap-3">
          <button onClick={onBack} className="text-[#B8B4AA] hover:text-[#C7A36D] transition-colors text-sm">← Volver</button>
          <span className="text-[#B8B4AA]">/</span>
          <span className="font-serif text-[#F4F2EC] truncate">{modulo.titulo}</span>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C7A36D] mb-3">Módulo {moduleIndex + 1}</p>
            <h1 className="font-serif text-4xl text-[#F4F2EC] mb-4">{modulo.titulo}</h1>
            <p className="text-[#B8B4AA] leading-relaxed">{modulo.descripcion}</p>
          </div>
          {(modulo.objetivos as string[])?.length > 0 && (
            <div className="mb-8 bg-[#141419] border border-[rgba(244,242,236,0.08)] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#C7A36D] mb-4">Objetivos</p>
              <ul className="space-y-2">
                {(modulo.objetivos as string[]).map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#B8B4AA] text-sm">
                    <span className="text-[#C7A36D] mt-0.5">·</span>{obj}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {contenidos.length > 0 && active && (
            <div className="mb-8 bg-[#141419] border border-[rgba(244,242,236,0.08)]">
              <div className="flex overflow-x-auto border-b border-[rgba(244,242,236,0.08)]">
                {contenidos.map((c, i) => (
                  <button key={i} onClick={() => setActiveContentIdx(i)}
                    className={`px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] whitespace-nowrap border-b-2 transition-colors ${
                      i === activeContentIdx ? 'border-[#C7A36D] text-[#C7A36D]' : 'border-transparent text-[#B8B4AA] hover:text-[#F4F2EC]'
                    }`}>
                    {ContentIcon(c.type)} {c.title || c.titulo}
                  </button>
                ))}
              </div>
              <div className="p-6"><ContentBlock content={active} /></div>
            </div>
          )}
          {modulo.ejercicio && (
            <div className="mb-8 border border-[rgba(199,163,109,0.2)] bg-[rgba(199,163,109,0.04)] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C7A36D] mb-3">Ejercicio</p>
              <h3 className="font-serif text-xl text-[#F4F2EC] mb-3">{(modulo.ejercicio as any).title || (modulo.ejercicio as any).titulo}</h3>
              <p className="text-[#B8B4AA] text-sm leading-relaxed mb-4">{(modulo.ejercicio as any).description || (modulo.ejercicio as any).descripcion}</p>
              {(modulo.ejercicio as any).deadline && (
                <div className="flex items-center gap-2 text-xs text-[#B8B4AA]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Fecha límite: {(modulo.ejercicio as any).deadline}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <button 
              onClick={onMarkComplete}
              disabled={markingComplete}
              className="font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {markingComplete ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Marcar como completado ✓
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ContentIcon(tipo: string) {
  return { video: '▶', pdf: '📄', texto: '📝', text: '📝', zoom: '📹', imagen: '🖼', image: '🖼' }[tipo] || '·';
}

function ContentBlock({ content }: { content: any }) {
  const { type, tipo, title, titulo, body, texto, url, text } = content;
  const contentType = type || tipo || 'texto';
  const contentTitle = title || titulo;
  const contentText = body || texto || text;
  const contentUrl = url;

  if (contentType === 'video') return (
    <div>
      {contentTitle && <h3 className="font-serif text-xl text-[#F4F2EC] mb-4">{contentTitle}</h3>}
      <div className="relative w-full aspect-video bg-black">
        <iframe src={contentUrl} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={contentTitle} />
      </div>
    </div>
  );
  if (contentType === 'texto' || contentType === 'text') return (
    <div className="prose-dark">
      {contentTitle && <h2>{contentTitle}</h2>}
      {contentText?.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
    </div>
  );
  if (contentType === 'pdf') return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-16 h-16 bg-[rgba(199,163,109,0.1)] flex items-center justify-center text-3xl">📄</div>
      <p className="font-serif text-lg text-[#F4F2EC]">{contentTitle}</p>
      <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 border border-[rgba(199,163,109,0.4)] text-[#C7A36D] hover:bg-[rgba(199,163,109,0.08)] transition-colors">Descargar PDF</a>
    </div>
  );
  if (contentType === 'zoom') return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-16 h-16 bg-blue-500/10 flex items-center justify-center text-3xl">📹</div>
      <p className="font-serif text-lg text-[#F4F2EC]">{contentTitle}</p>
      <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors">Unirse a Zoom</a>
    </div>
  );
  if (contentType === 'imagen' || contentType === 'image') return (
    <div>
      {contentTitle && <h3 className="font-serif text-xl text-[#F4F2EC] mb-4">{contentTitle}</h3>}
      <img src={contentUrl} alt={contentTitle} className="w-full rounded" />
    </div>
  );
  return <p className="text-[#B8B4AA]">Contenido no disponible.</p>;
}

// Import Loader2
import { Loader2 } from 'lucide-react';
