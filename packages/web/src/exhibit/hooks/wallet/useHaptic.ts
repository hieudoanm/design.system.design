import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  error: [30, 50, 30],
};

export const useHaptic = () => {
  const vibrate = useCallback((pattern: HapticPattern = 'light') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(PATTERNS[pattern]);
    }
  }, []);

  return { vibrate };
};
