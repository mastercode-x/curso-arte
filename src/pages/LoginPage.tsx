import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { publicApi } from '@/services/api';

type View = 'login' | 'forgot' | 'forgot-sent';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isProfessor, isAuthenticated } = useAuth();

  const [view, setView] = useState<View>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Forzar tema oscuro siempre en login
  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);

  // Redirigir si ya tiene sesión activa
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isProfessor ? '/profesor' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isProfessor, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(formData);
    } catch (err: any) {
      setLocalError(err?.message || 'Error al iniciar sesión');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!forgotEmail) return;
    try {
      setIsSendingReset(true);
      await publicApi.post('/auth/forgot-password', { email: forgotEmail });
      setView('forgot-sent');
    } catch {
      setLocalError('No se pudo procesar la solicitud. Intentá de nuevo.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSolicitarAcceso = (e: React.MouseEvent) => {
    e.preventDefault();
    sessionStorage.setItem('scrollTo', 'instructor');
    window.location.href = '/#/';
  };

  const switchView = (v: View) => {
    setLocalError(null);
    setView(v);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-[#C7A36D]/5 via-transparent to-[#C7A36D]/5 pointer-events-none" />

      <Card className="w-full max-w-md bg-[#141419] border-[rgba(244,242,236,0.08)] relative z-10 mx-4">

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <>
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[rgba(199,163,109,0.15)] flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-[#C7A36D] text-lg sm:text-xl font-serif">P</span>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-serif text-[#F4F2EC]">
                Bienvenido de vuelta
              </CardTitle>
              <CardDescription className="text-[#B8B4AA] text-sm">
                Inicia sesión para continuar tu viaje artístico
              </CardDescription>
            </CardHeader>

            <CardContent>
              {(error || localError) && (
                <Alert className="mb-4 bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{error || localError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#F4F2EC]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8B4AA]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC] placeholder:text-[#B8B4AA]/50 focus:border-[#C7A36D]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[#F4F2EC]">Contraseña</Label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#B8B4AA]/60 hover:text-[#C7A36D] transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8B4AA]" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC] placeholder:text-[#B8B4AA]/50 focus:border-[#C7A36D]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B4AA] hover:text-[#F4F2EC]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D] font-medium"
                >
                  {isLoading ? 'Iniciando sesión...' : (
                    <> Iniciar sesión <ArrowRight className="ml-2 w-4 h-4" /> </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-[#B8B4AA]">
                  ¿No tienes cuenta?{' '}
                  <a href="/" onClick={handleSolicitarAcceso} className="text-[#C7A36D] hover:underline cursor-pointer">
                    Solicita acceso al curso
                  </a>
                </p>
              </div>
            </CardContent>
          </>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {view === 'forgot' && (
          <>
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[rgba(199,163,109,0.15)] flex items-center justify-center mb-3 sm:mb-4">
                <KeyRound className="w-5 h-5 text-[#C7A36D]" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-serif text-[#F4F2EC]">
                Recuperar acceso
              </CardTitle>
              <CardDescription className="text-[#B8B4AA] text-sm">
                Ingresá tu email y te enviaremos una nueva contraseña temporal
              </CardDescription>
            </CardHeader>

            <CardContent>
              {localError && (
                <Alert className="mb-4 bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{localError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-[#F4F2EC]">Email registrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8B4AA]" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10 bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC] placeholder:text-[#B8B4AA]/50 focus:border-[#C7A36D]"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSendingReset || !forgotEmail}
                  className="w-full bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D] font-medium"
                >
                  {isSendingReset ? 'Enviando...' : (
                    <> Enviar nueva contraseña <ArrowRight className="ml-2 w-4 h-4" /> </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => switchView('login')}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#B8B4AA]/60 hover:text-[#C7A36D] transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Volver al inicio de sesión
                </button>
              </div>
            </CardContent>
          </>
        )}

        {/* ── FORGOT SENT ── */}
        {view === 'forgot-sent' && (
          <>
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/15 flex items-center justify-center mb-3 sm:mb-4">
                <Mail className="w-5 h-5 text-green-400" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-serif text-[#F4F2EC]">
                Email enviado
              </CardTitle>
              <CardDescription className="text-[#B8B4AA] text-sm leading-relaxed">
                Si <span className="text-[#F4F2EC]">{forgotEmail}</span> está registrado, recibirás tu nueva contraseña temporal en breve.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="bg-[rgba(199,163,109,0.06)] border border-[rgba(199,163,109,0.15)] p-4 mb-6 text-sm text-[#B8B4AA] leading-relaxed">
                Revisá tu bandeja de entrada y la carpeta de spam. Una vez que ingreses, podés cambiar la contraseña desde tu perfil.
              </div>

              <Button
                onClick={() => switchView('login')}
                className="w-full bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D] font-medium"
              >
                Volver al inicio de sesión
              </Button>
            </CardContent>
          </>
        )}

      </Card>
    </div>
  );
};

export default LoginPage;