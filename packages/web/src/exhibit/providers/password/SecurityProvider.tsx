'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useData } from '@/exhibit/providers/password/DataProvider';
import { useToast } from '@/exhibit/providers/password/ToastProvider';
import {
  hashPassword,
  isLockFlagSet,
  setLockFlag,
  clearLockFlag,
} from '@/exhibit/lib/password/security';
import { LockScreen } from '@/exhibit/components/password/organisms/LockScreen';

interface SecurityContextType {
  isLocked: boolean;
  lock: () => void;
  unlock: (password: string) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurity = (): SecurityContextType => {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within SecurityProvider');
  return ctx;
};

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useData();
  const { addToast } = useToast();
  const configured = Boolean(
    settings.masterPasswordHash && settings.masterPasswordSalt
  );
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (configured && isLockFlagSet()) setIsLocked(true);
  }, [configured]);

  useEffect(() => {
    if (!configured || !settings.lockOnClose) return;
    const onLeave = (): void => setLockFlag();
    window.addEventListener('pagehide', onLeave);
    return () => window.removeEventListener('pagehide', onLeave);
  }, [configured, settings.lockOnClose]);

  const lock = useCallback((): void => {
    setLockFlag();
    setIsLocked(true);
    setError(null);
  }, []);

  const unlock = useCallback(
    async (password: string): Promise<boolean> => {
      if (!configured) return false;
      const hash = await hashPassword(
        password,
        settings.masterPasswordSalt as string
      );
      if (hash === settings.masterPasswordHash) {
        clearLockFlag();
        setIsLocked(false);
        setError(null);
        return true;
      }
      setError('Incorrect password');
      return false;
    },
    [configured, settings.masterPasswordHash, settings.masterPasswordSalt]
  );

  const handleBiometric = useCallback((): void => {
    clearLockFlag();
    setIsLocked(false);
    setError(null);
    addToast('Biometric verified (mock)', 'success');
  }, [addToast]);

  if (isLocked) {
    return (
      <LockScreen
        error={error ?? undefined}
        onUnlock={unlock}
        biometricEnabled={Boolean(settings.biometricEnabled)}
        onBiometric={handleBiometric}
      />
    );
  }

  return (
    <SecurityContext.Provider value={{ isLocked, lock, unlock }}>
      {children}
    </SecurityContext.Provider>
  );
};
