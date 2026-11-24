import type { FC } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertItem {
  id: string;
  message: string;
  type?: AlertType;
}

interface AlertsCardProps {
  alerts: AlertItem[];
  title?: string;
}

const alertClasses: Record<AlertType, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

export const AlertsCard: FC<AlertsCardProps> = ({
  alerts,
  title = 'Alerts',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="alerts-card">
    <div className="card-body gap-3">
      <h3 className="card-title text-base">{title}</h3>
      {alerts.length === 0 ? (
        <p className="text-base-content/50 text-sm">All caught up</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              data-testid="alert-item"
              className={`alert ${alertClasses[alert.type ?? 'info']} py-2 text-sm`}>
              {alert.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);
