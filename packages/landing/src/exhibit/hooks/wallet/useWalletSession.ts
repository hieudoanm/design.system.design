'use client';

import { useCallback, useState } from 'react';
import { startWalletSession } from '@/exhibit/lib/wallet/session';

/**
 * Establishes a wallet session from any shared auth page and reports where the
 * visitor should land next. Returns `null` when the page is rendered outside a
 * browser (SSR), so the caller can skip the redirect.
 */
export const useWalletSession = () => {
  const [error, setError] = useState('');

  const signInWallet = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;

    const next =
      new URLSearchParams(window.location.search).get('next') || '/design-system/exhibits/wallet';
    startWalletSession();

    return next.startsWith('/design-system/exhibits/wallet') ? next : '/design-system/exhibits/wallet';
  }, []);

  return { signInWallet, error, setError };
};
