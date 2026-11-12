'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export const useKeyboard = (shortcuts: ShortcutMap): void => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = [];
      if (e.ctrlKey || e.metaKey) key.push('ctrl');
      if (e.shiftKey) key.push('shift');
      if (e.altKey) key.push('alt');
      key.push(e.key.toLowerCase());
      const combo = key.join('+');

      if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo]();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
