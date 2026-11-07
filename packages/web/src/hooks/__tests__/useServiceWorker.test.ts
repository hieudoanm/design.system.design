import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useServiceWorker } from '@/hooks/useServiceWorker';

const register = vi.fn(() => Promise.resolve({} as ServiceWorkerRegistration));

const stubServiceWorker = (supported: boolean) => {
  // The key must be absent, not undefined: the hook checks `in navigator`.
  vi.stubGlobal('navigator', supported ? { serviceWorker: { register } } : {});
};

beforeEach(() => {
  register.mockClear();
  stubServiceWorker(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useServiceWorker', () => {
  it('registers the worker at the base-pathed URL', () => {
    renderHook(() => useServiceWorker());
    expect(register).toHaveBeenCalledWith('/sw.js');
  });

  it('does nothing when service workers are unsupported', () => {
    stubServiceWorker(false);
    renderHook(() => useServiceWorker());
    expect(register).not.toHaveBeenCalled();
  });

  it('waits for the load event while the page is still loading', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    renderHook(() => useServiceWorker());
    expect(register).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));
    expect(register).toHaveBeenCalledWith('/sw.js');
  });

  it('swallows a failed registration', async () => {
    register.mockRejectedValueOnce(new Error('denied'));
    renderHook(() => useServiceWorker());
    // If the .catch were missing this would surface as an unhandled rejection.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(register).toHaveBeenCalled();
  });
});
