import { useCallback, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { admin, accessToken, setSession, clearSession, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((a) => useAuthStore.setState({ admin: a }))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, [hydrate, clearSession]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      const data = await authService.login(email, password);
      setSession(data.tokens, data.admin, rememberMe);
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
  }, [clearSession]);

  return {
    admin,
    loading,
    isAuthenticated: !!accessToken && !!admin,
    login,
    logout,
  };
}
