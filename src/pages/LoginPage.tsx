import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isProfessor, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState<string | null>(null);

  // ✅ Redirigir si ya tiene sesión activa
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
    // El AuthContext ya maneja el redirect:
    // - estudiante sin onboarding → /#/onboarding
    // - estudiante con onboarding → /dashboard
    // - profesor → /profesor
    // Solo llegamos acá si el AuthContext no redirigió (no debería pasar)
  } catch (err: any) {
    setLocalError(err?.message || 'Error al iniciar sesión');
  }
};

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#C7A36D]/5 via-transparent to-[#C7A36D]/5 pointer-events-none" />
      
      <Card className="w-full max-w-md bg-[#141419] border-[rgba(244,242,236,0.08)] relative z-10 mx-4">
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
              <Label htmlFor="password" className="text-[#F4F2EC]">Contraseña</Label>
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
              {isLoading ? (
                'Iniciando sesión...'
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-[#B8B4AA]">
              ¿No tienes cuenta?{' '}
             <Link to="/#instructor" className="text-[#C7A36D] hover:underline">
  Solicita acceso al curso
</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;