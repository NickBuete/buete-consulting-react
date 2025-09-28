import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { AuthResponse, AuthUser, UserRole } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { username: string; email: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'buete-auth-state-v1';

const persistState = (state: { token: string; user: AuthUser }) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const readPersistedState = (): { token: string; user: AuthUser } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as { token: string; user: AuthUser };
  } catch (error) {
    console.warn('Failed to parse auth state', error); // eslint-disable-line no-console
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((auth: AuthResponse) => {
    setUser(auth.user);
    setToken(auth.token);
    api.setAuthToken(auth.token);
    persistState({ token: auth.token, user: auth.user });
  }, []);

  useEffect(() => {
    const persisted = readPersistedState();
    if (!persisted) {
      setLoading(false);
      return;
    }

    const bootstrap = async () => {
      try {
        api.setAuthToken(persisted.token);
        const response = await api.get<{ user: AuthUser }>('/auth/me');
        setUser(response.user);
        setToken(persisted.token);
        persistState({ token: persisted.token, user: response.user });
      } catch (error) {
        console.warn('Failed to restore session', error); // eslint-disable-line no-console
        api.removeAuthToken();
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      applySession(response);
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  const register = useCallback(
    async (payload: { username: string; email: string; password: string; role: UserRole }) => {
      setLoading(true);
      try {
        const response = await api.post<AuthResponse>('/auth/register', payload);
        applySession(response);
      } finally {
        setLoading(false);
      }
    },
    [applySession],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    api.removeAuthToken();
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) {
        return false;
      }
      if (roles.length === 0) {
        return !!user;
      }
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout, hasRole }),
    [user, token, loading, login, register, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
