'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MenuState } from '@/exhibit/types/menu';
import { emptyMenu } from '@/exhibit/lib/menu';
import { seedMenuData } from '@/exhibit/lib/menu/seed';
import { storage } from '@/exhibit/lib/menu/storage';

const STATE_KEY = 'menu-state';

export const useMenuStore = () => {
  const [state, setState] = useState<MenuState>(() => {
    return storage.get<MenuState>(STATE_KEY) ?? seedMenuData();
  });

  useEffect(() => {
    storage.set(STATE_KEY, state);
  }, [state]);

  const reset = useCallback(() => {
    setState(emptyMenu());
  }, []);

  return { state, setState, reset };
};
