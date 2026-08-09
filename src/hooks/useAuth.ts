import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      const token = api.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch (err: any) {
        console.warn('Session check failed or expired:', err.message);
        api.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: authUser } = await api.login(credentials);
      setUser(authUser);
      return authUser;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: newUser } = await api.register(data);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: guestUser } = await api.loginAsGuest();
      setUser(guestUser);
      return guestUser;
    } catch (err: any) {
      setError(err.message || 'Guest login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return { user, isLoading, error, login, register, loginAsGuest, logout };
}
