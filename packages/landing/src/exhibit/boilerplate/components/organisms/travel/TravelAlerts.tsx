import type { FC } from 'react';

interface Alert {
  id: string;
  type: 'advisory' | 'warning' | 'info';
  title: string;
  description: string;
  date?: string;
}

interface TravelAlertsProps {
  alerts: Alert[];
}

const TYPE_BADGE: Record<Alert['type'], string> = {
  advisory: 'badge-warning',
  warning: 'badge-error',
  info: 'badge-info',
};

export const TravelAlerts: FC<TravelAlertsProps> = ({ alerts }) => {
  return (
    <section data-testid="travel-alerts" className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Travel alerts</h2>
      <div className="flex flex-col gap-3">
        {alerts.length === 0 && (
          <div className="alert alert-success">
            <span>No active alerts for this region.</span>
          </div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert ${alert.type === 'warning' ? 'alert-error' : alert.type === 'info' ? 'alert-info' : 'alert-warning'}`}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">{alert.title}</h3>
                <span className={`badge badge-sm ${TYPE_BADGE[alert.type]}`}>
                  {alert.type}
                </span>
              </div>
              <p className="text-sm opacity-80">{alert.description}</p>
              {alert.date && <p className="text-xs opacity-70">{alert.date}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
