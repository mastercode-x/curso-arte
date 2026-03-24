import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BookOpen, CheckCircle, Clock, Play, Award, LogOut, User, ChevronRight, Lock, Settings, X, Bell, Star, Loader2 } from 'lucide-react';
import ThemeToggle from '../components/shared/ThemeToggle';
import { toast } from 'sonner';
import * as dashboardApi from '../services/dashboardApi';
import * as moduleApi from '../services/moduleApi';
import * as studentApi from '../services/studentApi';
import { useAuth } from '@/contexts/AuthContext';

import { generateCertificate } from '../utils/generateCertificate';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
 const [activeModuleId, setActiveModuleId] = useState<string | null>(
  () => localStorage.getItem('activeModuleId')
);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);


  useEffect(() => {
  if (activeModuleId) {
    localStorage.setItem('activeModuleId', activeModuleId);
  } else {
    localStorage.removeItem('activeModuleId');
  }
}, [activeModuleId]);
  

   
const handleDownloadCertificate = async () => {
  if (!allCompleted) return;
  try {
    setIsGenerating(true);
    await generateCertificate({ studentName: perfil.nombre });
  } catch {
    toast.error('Error generando el certificado');
  } finally {
    setIsGenerating(false);
  }
};

const loadDashboardData = async (silent = false) => {
  try {
    if (!silent) setIsLoading(true);
    const dashboardData = await dashboardApi.getStudentDashboard();
    setData(dashboardData);
  } catch (error) {
    toast.error('Error cargando datos del dashboard');
  } finally {
    if (!silent) setIsLoading(false);
  }

  console.log(data)
};

  const notifications = [
    { id: 1, text: "Bienvenido al curso Poética de la Mirada", time: "Ahora", read: false },
    ...(data?.siguienteModulo ? [{ id: 2, text: `Continúa con: ${data.siguienteModulo.titulo}`, time: "Reciente", read: false }] : []),
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

const perfil = data?.estudiante || data?.perfil || { nombre: user?.nombre || 'Estudiante', email: user?.email || '' };
  const estadisticas = data?.estadisticas || { progresoGeneral: 0, totalModulos: 0, modulosCompletados: 0 };
  const modulos = data?.modulos || [];
  const siguienteModulo = data?.siguienteModulo;
  const allCompleted = estadisticas.progresoGeneral === 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
      </div>
    );
  }

  if (activeModuleId) {
    return <ModuleViewer 
  moduloId={activeModuleId}
  onBack={() => {
  setActiveModuleId(null);
  localStorage.removeItem('activeModuleId');
}}
  onComplete={() => loadDashboardData(true)}
  modulos={modulos}
  onNavigate={setActiveModuleId}
/>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* Header */}
      <header className="bg-[#141419] border-b border-[rgba(244,242,236,0.08)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <span className="font-serif text-base sm:text-lg text-[#F4F2EC]">Poética de la Mirada</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative p-1.5 sm:p-2 text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#C7A36D] rounded-full" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-80 bg-[#141419] border border-[rgba(244,242,236,0.12)] shadow-xl z-50">
                  <div className="p-3 sm:p-4 border-b border-[rgba(244,242,236,0.08)] flex justify-between items-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA]">Notificaciones</p>
                    <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-[#B8B4AA]" /></button>
                  </div>
                  <div>
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 sm:p-4 border-b border-[rgba(244,242,236,0.04)] ${!n.read ? 'bg-[rgba(199,163,109,0.04)]' : ''}`}>
                        <div className="flex gap-3">
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#C7A36D] mt-1.5 shrink-0" />}
                          <div className={n.read ? 'pl-4' : ''}>
                            <p className="text-xs sm:text-sm text-[#F4F2EC] mb-1">{n.text}</p>
                            <p className="text-[10px] sm:text-xs text-[#B8B4AA]">{n.time}</p>
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
                <span className="hidden md:block text-sm text-[#B8B4AA]">{perfil.nombre}</span>
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#141419] border border-[rgba(244,242,236,0.12)] shadow-xl z-50">
                  <div className="p-4 border-b border-[rgba(244,242,236,0.08)]">
                    <p className="text-sm text-[#F4F2EC]">{perfil.nombre}</p>
                    <p className="text-xs text-[#B8B4AA]">{perfil.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { setShowProfile(false); document.getElementById('perfil-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#B8B4AA] hover:text-[#C7A36D] hover:bg-[rgba(199,163,109,0.05)] transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Editar perfil
                    </button>
                    <button
                      onClick={logout}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10" onClick={() => { setShowNotifications(false); setShowProfile(false); }}>
        {/* Welcome */}
        <div className="mb-6 sm:mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#C7A36D] mb-1 sm:mb-2">Bienvenido de vuelta</p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#F4F2EC]">{perfil.nombre}</h1>
          </div>
          {siguienteModulo && (
            <button
              onClick={() => setActiveModuleId(siguienteModulo.id)}
              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors w-full md:w-auto justify-center"
            >
              <Play className="w-4 h-4" />
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.14em] truncate">Continuar: {siguienteModulo.titulo}</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
          {[
            { icon: Award, label: "Progreso general", value: `${estadisticas.progresoGeneral}%`, color: "text-[#C7A36D]", bg: "bg-[rgba(199,163,109,0.1)]" },
            { icon: CheckCircle, label: "Completados", value: estadisticas.modulosCompletados, color: "text-green-400", bg: "bg-green-400/10" },
            { icon: Clock, label: "En progreso", value: modulos.filter((m: any) => m.estado === 'en_progreso').length, color: "text-blue-400", bg: "bg-blue-400/10" },
            { icon: BookOpen, label: "Total módulos", value: modulos.length, color: "text-[#C7A36D]", bg: "bg-[rgba(199,163,109,0.1)]" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] sm:text-xs text-[#B8B4AA]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-6 sm:mb-10 bg-[#141419] border border-[rgba(244,242,236,0.08)] p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.14em] text-[#B8B4AA]">Progreso del curso</span>
            <span className="font-mono text-[10px] sm:text-xs text-[#C7A36D]">{estadisticas.modulosCompletados} / {modulos.length} módulos</span>
          </div>
          <div className="h-1.5 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C7A36D] rounded-full transition-all duration-700"
              style={{ width: `${estadisticas.progresoGeneral}%` }}
            />
          </div>
        </div>

        {/* Modules */}
        <div className="mb-12 sm:mb-16">
          <h2 className="font-serif text-xl sm:text-2xl text-[#F4F2EC] mb-4 sm:mb-6">Módulos del curso</h2>
          <div className="space-y-3">
            {modulos.map((m: any, i: number) => {
              const isCompleted = m.estado === 'completado';
              const isInProgress = m.estado === 'en_progreso';
              const isLocked = m.estado === 'no_iniciado' && i > 0 && modulos[i - 1]?.estado !== 'completado';

              return (
                <div
                  key={m.id}
                  className={`group flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
                    isLocked
                      ? 'border-[rgba(244,242,236,0.04)] opacity-50 cursor-not-allowed'
                      : 'border-[rgba(244,242,236,0.08)] hover:border-[rgba(199,163,109,0.3)] hover:bg-[rgba(199,163,109,0.03)]'
                  }`}
                  onClick={() => !isLocked && setActiveModuleId(m.id)}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border ${
                    isCompleted ? 'bg-[rgba(199,163,109,0.15)] border-[rgba(199,163,109,0.4)]' :
                    isInProgress ? 'bg-blue-400/10 border-blue-400/30' :
                    'bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.1)]'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7A36D]" /> :
                     isLocked ? <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8B4AA]" /> :
                     <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8B4AA]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                      <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] opacity-70">
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      {isCompleted && <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] bg-[rgba(199,163,109,0.1)] px-1.5 sm:px-2 py-0.5">Completado</span>}
                      {isInProgress && <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-blue-400 bg-blue-400/10 px-1.5 sm:px-2 py-0.5">En progreso</span>}
                    </div>
                    <h3 className="font-serif text-base sm:text-lg text-[#F4F2EC] group-hover:text-[#C7A36D] transition-colors truncate">{m.titulo}</h3>
                    <p className="text-xs sm:text-sm text-[#B8B4AA] mt-0.5 sm:mt-1 line-clamp-1">{m.descripcion}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="text-xs text-[#B8B4AA]">{m.duracion}</p>
                      {isInProgress && (
                        <p className="text-xs text-blue-400">{m.progreso}% completado</p>
                      )}
                    </div>
                    {isInProgress && (
                      <div className="w-16 sm:w-20 h-1 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400" style={{ width: `${m.progreso}%` }} />
                      </div>
                    )}
                    {!isLocked && <ChevronRight className="w-4 h-4 text-[#B8B4AA] group-hover:text-[#C7A36D] transition-colors" />}
                  </div>
                </div>
              );
            })}

            {/* Certificate row */}
            <div className={`flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border transition-all duration-200 ${
              allCompleted
                ? 'border-[rgba(199,163,109,0.4)] bg-[rgba(199,163,109,0.06)] cursor-pointer hover:bg-[rgba(199,163,109,0.1)]'
                : 'border-[rgba(244,242,236,0.04)] opacity-40 cursor-not-allowed'
            }`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border ${
                allCompleted ? 'bg-[rgba(199,163,109,0.2)] border-[#C7A36D]' : 'bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.1)]'
              }`}>
                <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${allCompleted ? 'text-[#C7A36D]' : 'text-[#B8B4AA]'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] opacity-70">
                    Certificado
                  </p>
                  {allCompleted && <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] bg-[rgba(199,163,109,0.1)] px-1.5 sm:px-2 py-0.5">Desbloqueado</span>}
                </div>
                <h3 className={`font-serif text-base sm:text-lg ${allCompleted ? 'text-[#C7A36D]' : 'text-[#F4F2EC]'}`}>
                  Certificado de finalización
                </h3>
                <p className="text-xs sm:text-sm text-[#B8B4AA] mt-0.5 sm:mt-1">
                  {allCompleted
                    ? 'Completaste el curso. Podés descargar tu certificado.'
                    : `Completá los ${modulos.length} módulos para desbloquear el certificado.`}
                </p>
              </div>
              {allCompleted && (
                <button
  onClick={handleDownloadCertificate}
  disabled={isGenerating}
  className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] px-3 sm:px-5 py-2 sm:py-2.5 border border-[#C7A36D] text-[#C7A36D] hover:bg-[rgba(199,163,109,0.1)] transition-colors disabled:opacity-50"
>
  {isGenerating ? 'Generando...' : 'Descargar'}
</button>
              )}
              {!allCompleted && <Lock className="w-4 h-4 text-[#B8B4AA]" />}
            </div>
          </div>
        </div>

        {/* Profile settings */}
        <div id="perfil-section" className="mb-8 sm:mb-10">
          <h2 className="font-serif text-xl sm:text-2xl text-[#F4F2EC] mb-4 sm:mb-6">Mi perfil</h2>
          <ProfileEditor perfil={perfil} onSave={loadDashboardData} />
        </div>
      </main>
    </div>
  );
}

// ── Profile Editor ────────────────────────────────────────────────
function ProfileEditor({ perfil, onSave }: { perfil: any, onSave: () => void }) {
  const [form, setForm] = useState(perfil);

  useEffect(() => {
    setForm(perfil);
  }, [perfil]);

 
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
const [showPasswords, setShowPasswords] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [isSavingPass, setIsSavingPass] = useState(false);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await studentApi.updateStudentProfile({
        nombre: form.nombre,
        telefono: form.telefono,
        pais: form.pais,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave();
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error actualizando perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      setIsSavingPass(true);
      await studentApi.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Contraseña actualizada');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error cambiando contraseña');
    } finally {
      setIsSavingPass(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSave} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-4 sm:p-6 max-w-2xl">
        {saved && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            ✓ Perfil actualizado
          </div>
        )}
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-4 sm:mb-5">Datos personales</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {[
            { key: 'nombre', label: 'Nombre completo', type: 'text' },
            { key: 'email', label: 'Email', type: 'email', disabled: true },
            { key: 'telefono', label: 'Teléfono', type: 'tel' },
            { key: 'pais', label: 'País', type: 'text' },
          ].map(({ key, label, type, disabled }: any) => (
            <div key={key}>
              <label className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-1.5 sm:mb-2">{label}</label>
              <input
                type={type}
                value={form[key] || ''}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                disabled={disabled}
                className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors disabled:opacity-50"
              />
            </div>
          ))}
        </div>
        <button type="submit" disabled={isSaving}
          className="font-mono text-xs uppercase tracking-[0.14em] px-6 sm:px-8 py-3 sm:py-3.5 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors disabled:opacity-50">
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-4 sm:p-6 max-w-2xl mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-4 sm:mb-5">Cambiar contraseña</p>
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
         {[
  { key: 'currentPassword', label: 'Contraseña actual' },
  { key: 'newPassword', label: 'Nueva contraseña' },
  { key: 'confirmPassword', label: 'Confirmar nueva contraseña' },
].map(({ key, label }) => (
  <div key={key}>
    <label className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-1.5 sm:mb-2">{label}</label>
    <div className="relative">
      <input
        type={showPasswords[key as keyof typeof showPasswords] ? 'text' : 'password'}
        value={passForm[key as keyof typeof passForm]}
        onChange={e => setPassForm({ ...passForm, [key]: e.target.value })}
        className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-3 sm:px-4 py-2.5 sm:py-3 pr-10 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors"
      />
      <button type="button"
        onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key as keyof typeof showPasswords] }))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B4AA] hover:text-[#F4F2EC]">
        {showPasswords[key as keyof typeof showPasswords] ? '🙈' : '👁'}
      </button>
    </div>
  </div>
))}
        </div>
        <button type="submit" disabled={isSavingPass}
          className="font-mono text-xs uppercase tracking-[0.14em] px-6 sm:px-8 py-3 sm:py-3.5 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors disabled:opacity-50">
          {isSavingPass ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </>
  );
}

// ── Module Viewer ─────────────────────────────────────────────────
function ModuleViewer({ moduloId, onBack, onComplete, modulos, onNavigate }: {    moduloId: string
  onBack: () => void
  onComplete?: () => void
  modulos: any[]
  onNavigate: (id: string) => void }) {
  const [modulo, setModulo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeContentIdx, setActiveContentIdx] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
const [isCompleted, setIsCompleted] = useState(false);

const currentIndex = modulos.findIndex(m => m.id === moduloId);
const prevModulo = currentIndex > 0 ? modulos[currentIndex - 1] : null;
const nextModulo = currentIndex < modulos.length - 1 ? modulos[currentIndex + 1] : null;

  useEffect(() => {
    loadModulo();
  }, [moduloId]);

const loadModulo = async () => {
  try {
    setIsLoading(true);
    const data = await moduleApi.getModule(moduloId);
    setModulo(data);
    // Verificar si ya está completado
    const progress = await moduleApi.getMyProgress();
    const thisProgress = progress?.progresoDetalle?.find((p: any) => p.moduloId === moduloId);
    if (thisProgress?.completudPorcentaje === 100) setIsCompleted(true);
  } catch (error) {
    toast.error('Error cargando módulo');
  } finally {
    setIsLoading(false);
  }
};

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      await moduleApi.updateModuleProgress(moduloId, { completudPorcentaje: 100, completado: true });
      toast.success('¡Módulo completado!');
      setIsCompleted(true); // ← acá dentro ✅
      onComplete?.();
      await loadModulo();
    } catch (error) {
      toast.error('Error completando módulo');
    } finally {
      setIsCompleting(false);
    }
  };




  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
      </div>
    );
  }

  if (!modulo) return null;

  const contenidos = modulo.contenido || [];
  const active = contenidos[activeContentIdx];

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex overflow-hidden">
      <aside className="hidden lg:flex flex-col w-72 bg-[#141419] border-r border-[rgba(244,242,236,0.08)] fixed top-0 bottom-0 left-0 overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-[rgba(244,242,236,0.08)]">
          <button onClick={onBack} className="flex items-center gap-2 text-[#B8B4AA] hover:text-[#C7A36D] transition-colors text-sm mb-4">
            ← Volver
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C7A36D] mb-1">Módulo</p>
          <h2 className="font-serif text-base sm:text-lg text-[#F4F2EC] leading-tight">{modulo.titulo}</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
          {contenidos.map((c: any, i: number) => (
            <button key={i} onClick={() => setActiveContentIdx(i)}
              className={`w-full text-left flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded mb-1 transition-colors ${
                i === activeContentIdx ? 'bg-[rgba(199,163,109,0.1)] text-[#C7A36D]' : 'text-[#B8B4AA] hover:text-[#F4F2EC] hover:bg-[rgba(244,242,236,0.03)]'
              }`}>
              <span className="font-mono text-[10px] w-5 opacity-60">{ContentIcon(c.tipo)}</span>
              <span className="text-xs sm:text-sm truncate">{c.titulo}</span>
            </button>
          ))}
          {contenidos.length === 0 && <p className="text-[#B8B4AA] text-sm px-2 py-4">Sin contenido aún.</p>}
        </nav>
      </aside>
      <main className="flex-1 lg:ml-72 overflow-y-auto" style={{ height: '100vh' }}>
        <div className="lg:hidden p-3 sm:p-4 border-b border-[rgba(244,242,236,0.08)] flex items-center gap-2 sm:gap-3">
          <button onClick={onBack} className="text-[#B8B4AA] hover:text-[#C7A36D] transition-colors text-sm">← Volver</button>
          <span className="text-[#B8B4AA]">/</span>
          <span className="font-serif text-sm sm:text-base text-[#F4F2EC] truncate">{modulo.titulo}</span>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#C7A36D] mb-2 sm:mb-3">Módulo</p>
            <h1 className="font-serif text-2xl sm:text-4xl text-[#F4F2EC] mb-3 sm:mb-4">{modulo.titulo}</h1>
            <p className="text-sm sm:text-base text-[#B8B4AA] leading-relaxed">{modulo.descripcion}</p>
          </div>
          {modulo.objetivos?.length > 0 && (
            <div className="mb-6 sm:mb-8 bg-[#141419] border border-[rgba(244,242,236,0.08)] p-4 sm:p-6">
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.14em] text-[#C7A36D] mb-3 sm:mb-4">Objetivos</p>
              <ul className="space-y-2">
                {modulo.objetivos.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3 text-[#B8B4AA] text-xs sm:text-sm">
                    <span className="text-[#C7A36D] mt-0.5">·</span>{obj}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {contenidos.length > 0 && active && (
            <div className="mb-6 sm:mb-8 bg-[#141419] border border-[rgba(244,242,236,0.08)]">
              <div className="flex overflow-x-auto border-b border-[rgba(244,242,236,0.08)]">
                {contenidos.map((c: any, i: number) => (
                  <button key={i} onClick={() => setActiveContentIdx(i)}
                    className={`px-3 sm:px-5 py-2.5 sm:py-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] whitespace-nowrap border-b-2 transition-colors ${
                      i === activeContentIdx ? 'border-[#C7A36D] text-[#C7A36D]' : 'border-transparent text-[#B8B4AA] hover:text-[#F4F2EC]'
                    }`}>
                    {ContentIcon(c.tipo)} <span className="truncate">{c.titulo}</span>
                  </button>
                ))}
              </div>
              <div className="p-4 sm:p-6"><ContentBlock content={active} /></div>
            </div>
          )}
          {modulo.ejercicio?.titulo && (
            <div className="mb-6 sm:mb-8 border border-[rgba(199,163,109,0.2)] bg-[rgba(199,163,109,0.04)] p-4 sm:p-6">
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#C7A36D] mb-2 sm:mb-3">Ejercicio</p>
              <h3 className="font-serif text-lg sm:text-xl text-[#F4F2EC] mb-2 sm:mb-3">{modulo.ejercicio.titulo}</h3>
              <p className="text-[#B8B4AA] text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">{modulo.ejercicio.descripcion}</p>
              {modulo.ejercicio.deadline && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#B8B4AA]">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Fecha límite: {modulo.ejercicio.deadline}</span>
                </div>
              )}
            </div>
          )}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(244,242,236,0.08)]">
  {prevModulo ? (
    <button
      onClick={() => { onNavigate(prevModulo.id); setIsCompleted(false); setActiveContentIdx(0); }}
      className="flex items-center gap-2 px-4 py-2.5 border border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:text-[#F4F2EC] hover:border-[rgba(244,242,236,0.3)] transition-all font-mono text-xs uppercase tracking-[0.14em]"
    >
      ← Módulo anterior
    </button>
  ) : <div />}

  <div className="flex items-center gap-3">
    <button
      className={`font-mono text-[10px] sm:text-xs uppercase tracking-[0.14em] px-4 sm:px-6 py-2.5 sm:py-3 transition-colors ${
        isCompleted
          ? 'bg-green-600/20 border border-green-600/40 text-green-400 cursor-default'
          : 'bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a]'
      }`}
      onClick={!isCompleted ? handleComplete : undefined}
      disabled={isCompleting}
    >
      {isCompleting ? 'Guardando...' : isCompleted ? '✓ Completado' : 'Marcar como completado'}
    </button>


{nextModulo ? (
  <button
    onClick={() => { onNavigate(nextModulo.id); setIsCompleted(false); setActiveContentIdx(0); }}
    className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(199,163,109,0.1)] text-[#C7A36D] hover:bg-[rgba(199,163,109,0.2)] transition-all font-mono text-xs uppercase tracking-[0.14em]"
  >
    Siguiente módulo →
  </button>
) : isCompleted && (
  <button
    onClick={async () => {
      try {
        const { generateCertificate } = await import('../utils/generateCertificate');
        await generateCertificate({ studentName: modulo.estudianteNombre || '' });
      } catch {
        toast.error('Error generando el certificado');
      }
    }}
    className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(199,163,109,0.15)] border border-[rgba(199,163,109,0.4)] text-[#C7A36D] hover:bg-[rgba(199,163,109,0.25)] transition-all font-mono text-xs uppercase tracking-[0.14em]"
  >
    ★ Descargar certificado
  </button>
)}
  </div>
</div>
        </div>
      </main>
    </div>
  );
}

function ContentIcon(tipo: string) {
  return { video: '▶', pdf: '📄', texto: '📝', zoom: '📹', imagen: '🖼' }[tipo] || '·';
}

function ContentBlock({ content }: { content: any }) {
  const { tipo, titulo, texto, url } = content;
// DESPUÉS


if (tipo === 'video') return (
  <div>
    {titulo && <h3 className="font-serif text-xl text-[#F4F2EC] mb-4">{titulo}</h3>}
    <div className="relative w-full aspect-video bg-black">
      <iframe
        src={getEmbedUrl(url)}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={titulo}
      />
    </div>
  </div>
);
  if (tipo === 'texto') return (
    <div className="prose-dark">
      {titulo && <h2>{titulo}</h2>}
      {texto?.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
    </div>
  );
  if (tipo === 'pdf') return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-16 h-16 bg-[rgba(199,163,109,0.1)] flex items-center justify-center text-3xl">📄</div>
      <p className="font-serif text-lg text-[#F4F2EC]">{titulo}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 border border-[rgba(199,163,109,0.4)] text-[#C7A36D] hover:bg-[rgba(199,163,109,0.08)] transition-colors">Descargar PDF</a>
    </div>
  );
  if (tipo === 'zoom') return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-16 h-16 bg-blue-500/10 flex items-center justify-center text-3xl">📹</div>
      <p className="font-serif text-lg text-[#F4F2EC]">{titulo}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors">Unirse a Zoom</a>
    </div>
  );
if (tipo === 'imagen') return (
  <div>
    {titulo && <h3 className="font-serif text-xl text-[#F4F2EC] mb-4">{titulo}</h3>}
    <img
      src={getDriveImageUrl(url)}
      alt={titulo || 'Imagen del módulo'}
      className="w-full rounded object-contain max-h-[70vh]"
      onError={(e) => {
        const img = e.currentTarget;
        // Si falla el thumbnail, intentar con lh3 (CDN alternativo de Drive)
        if (!img.dataset.fallback) {
          img.dataset.fallback = '1';
          try {
            const u = new URL(url);
            const match = u.pathname.match(/\/file\/d\/([^/?#]+)/);
            const id = match ? match[1] : u.searchParams.get('id');
            if (id) { img.src = `https://lh3.googleusercontent.com/d/${id}`; return; }
          } catch {}
        }
        // Si también falla, mostrar mensaje
        img.style.display = 'none';
        const msg = document.createElement('p');
        msg.textContent = 'No se pudo cargar la imagen. Verificá que el archivo de Drive sea público.';
        msg.style.cssText = 'color:#B8B4AA;font-size:13px;padding:16px;text-align:center;border:1px solid rgba(244,242,236,0.08);';
        img.parentNode?.appendChild(msg);
      }}
    />
    {url && (
      <p className="text-[10px] text-[#B8B4AA]/40 mt-2 text-center font-mono">
        Para que la imagen cargue, el archivo debe estar compartido como "Cualquier persona con el enlace"
      </p>
    )}
  </div>
);
  return <p className="text-[#B8B4AA]">Contenido no disponible.</p>;
}





function getEmbedUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    // youtube.com/watch?v=ID
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    // youtu.be/ID
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // vimeo.com/ID
    if (u.hostname.includes('vimeo.com')) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
  } catch { /* url inválida, devolver tal cual */ }
  return rawUrl;
}



function getDriveImageUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  try {
    const u = new URL(rawUrl);
    if (u.hostname === 'drive.google.com') {
      // Formato: /file/d/FILE_ID/view  o  /file/d/FILE_ID/preview
      const match = u.pathname.match(/\/file\/d\/([^/?#]+)/);
      if (match) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1920`;
      }
      // Formato: /open?id=FILE_ID  o  /uc?id=FILE_ID
      const id = u.searchParams.get('id');
      if (id) {
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1920`;
      }
    }
  } catch { /* url inválida, devolver tal cual */ }
  return rawUrl;
}