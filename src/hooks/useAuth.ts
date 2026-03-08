import { useCallback, useState } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import type { LoginCredentials, RegisterData } from '@/types';

export const useAuth = () => {
  const auth = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await auth.login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      await auth.register(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  const logout = useCallback(() => {
    auth.logout();
  }, [auth]);

  const updateProfile = useCallback(async (data: { nombre?: string; avatarUrl?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await auth.updateProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  return {
    ...auth,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile
  };
};
