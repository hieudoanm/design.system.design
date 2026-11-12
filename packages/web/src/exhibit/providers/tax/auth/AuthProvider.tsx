'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_DELAY = Number(process.env.NEXT_PUBLIC_MOCK_DELAY ?? '800');

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('[AuthProvider] render');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('tax-auth') === 'true';
  });

  const login = useCallback(async (email: string, _password: string) => {
    console.log('[AuthProvider] login', { email });
    await delay(MOCK_DELAY);
    if (email && _password) {
      setIsAuthenticated(true);
      localStorage.setItem('tax-auth', 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    console.log('[AuthProvider] logout');
    setIsAuthenticated(false);
    localStorage.removeItem('tax-auth');
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    console.log('[AuthProvider] forgotPassword', { email });
    await delay(MOCK_DELAY);
    return true;
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      console.log('[AuthProvider] resetPassword', { token, newPassword });
      await delay(MOCK_DELAY);
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
