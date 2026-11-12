/**
 * Wallet session bridge.
 *
 * Wallet keeps its own auth state in `localStorage` because its data lives
 * client-side in IndexedDB. Exhibit's shared `/design-system/exhibits` and `/design-system/exhibits` pages
 * are static demos with no session store, so they call into here to establish a
 * wallet session; showcases no longer gate on it, but the sign-in demo still writes it.
 */

const WALLET_SESSION_KEY = 'wallet-auth';

export const getWalletSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(WALLET_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const startWalletSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WALLET_SESSION_KEY, 'true');
};

export const endWalletSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WALLET_SESSION_KEY);
};
