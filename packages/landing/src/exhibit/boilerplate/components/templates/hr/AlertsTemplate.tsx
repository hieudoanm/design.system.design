'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiRotateCcw,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

interface AlertItem {
  id: 'success' | 'info' | 'warning' | 'error';
  variant: string;
  title: string;
  message: string;
  icon: FC<{ className?: string }>;
}

const ALERTS: AlertItem[] = [
  {
    id: 'success',
    variant: 'alert-success',
    title: 'Success',
    message: 'Your changes have been saved successfully.',
    icon: FiCheckCircle,
  },
  {
    id: 'info',
    variant: 'alert-info',
    title: 'Info',
    message: 'A new version of the app is available.',
    icon: FiInfo,
  },
  {
    id: 'warning',
    variant: 'alert-warning',
    title: 'Warning',
    message: 'Your storage is almost full.',
    icon: FiAlertTriangle,
  },
  {
    id: 'error',
    variant: 'alert-error',
    title: 'Error',
    message: 'Payment failed. Please try again.',
    icon: FiXCircle,
  },
];

type AlertKind = AlertItem['id'];

export const AlertsTemplate: FC = () => {
  const [dismissed, setDismissed] = useState<AlertKind[]>([]);

  const dismiss = (id: AlertKind) => {
    setDismissed((prev) => [...prev, id]);
  };

  const reset = () => setDismissed([]);

  const visible = ALERTS.filter((alert) => !dismissed.includes(alert.id));

  return (
    <div className="bg-base-100 text-base-content flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Alerts
          </p>
          <h1>Alerts showcase</h1>
          <p className="text-base-content/50 text-sm">
            Dismissable alert banners for every tone.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-base-content/50 text-sm">
            {visible.length} of {ALERTS.length} alerts visible
          </p>
          <button
            type="button"
            onClick={reset}
            className="btn btn-ghost btn-sm gap-1">
            <FiRotateCcw className="h-4 w-4" />
            Reset alerts
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {visible.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`alert ${alert.variant} justify-start gap-3 shadow-sm`}>
                <Icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span className="font-medium">{alert.title}</span>
                  <span className="text-sm opacity-80">{alert.message}</span>
                </div>
                <button
                  type="button"
                  aria-label={`Dismiss ${alert.title}`}
                  onClick={() => dismiss(alert.id)}
                  className="btn btn-ghost btn-xs ml-auto">
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

AlertsTemplate.displayName = 'AlertsTemplate';
