'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  console.log('[ToastProvider] render');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
      requestAnimationFrame(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
        }
      });
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId++;
      console.log('[ToastProvider] showToast', { id, message, type });
      setToasts((prev) => [...prev, { id, message, type }]);
      announce(message);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        if (liveRegionRef.current) liveRegionRef.current.textContent = '';
      }, 3000);
    },
    [announce]
  );

  const removeToast = useCallback((id: number) => {
    console.log('[ToastProvider] removeToast', id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (liveRegionRef.current) liveRegionRef.current.textContent = '';
  }, []);

  const alertClass: Record<ToastType, string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Screen reader live region */}
      <div
        ref={liveRegionRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />

      {/* Visual toasts */}
      <div className="toast toast-end toast-bottom z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`alert ${alertClass[toast.type]} cursor-pointer`}
            onClick={() => removeToast(toast.id)}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
