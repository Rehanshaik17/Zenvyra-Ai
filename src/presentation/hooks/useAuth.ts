import { useState, useCallback, useEffect } from 'react';
import type { AuthUser } from '../../infrastructure/api/authApi';
import {
  login as apiLogin,
  signup as apiSignup,
  getMe,
  logout as apiLogout,
  getToken,
} from '../../infrastructure/api/authApi';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        apiLogout();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiLogin(email, password);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const data = await apiSignup(name, email, password);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    signup,
    logout,
    setError,
  };
};
