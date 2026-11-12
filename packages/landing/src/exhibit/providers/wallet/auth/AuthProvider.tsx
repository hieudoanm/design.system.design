'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  startWalletSession,
  endWalletSession,
  getWalletSession,
} from '@/exhibit/lib/wallet/session';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('[AuthProvider] render');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = getWalletSession();
    console.log('[AuthProvider] auth check', { stored });
    if (stored) setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    console.log('[AuthProvider] login', { email });
    if (!email) return false;
    startWalletSession();
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    console.log('[AuthProvider] logout');
    endWalletSession();
    setIsAuthenticated(false);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    console.log('[AuthProvider] forgotPassword', { email });
    if (!email) return false;
    return true;
  }, []);

  const resetPassword = useCallback(
    async (token: string, _newPassword: string) => {
      console.log('[AuthProvider] resetPassword', { token });
      if (!token) return false;
      return true;
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
