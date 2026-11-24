'use client';

import { createContext, useContext } from 'react';

/*
 * In-kit navigation for the ported boilerplate. The original app routed
 * with next/link + next/navigation; inside an exhibit there is no router
 * for /developer/dashboard, so the gallery provides this context and the
 * Link shim swaps the visible template instead of navigating away.
 */
export interface BoilerplateNav {
  /** The path the visible screen corresponds to, e.g. '/developer/dashboard'. */
  pathname: string;
  /** Show the template a path maps to (see routes.ts). */
  navigate: (path: string) => void;
}

export const BoilerplateNavContext = createContext<BoilerplateNav | null>(null);

/**
 * Stand-in for next/navigation's usePathname in the two ported organisms
 * that read it for active-state styling.
 */
export const useBoilerplatePathname = (): string =>
  useContext(BoilerplateNavContext)?.pathname ?? '/';
