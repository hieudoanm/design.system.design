import type { FC } from 'react';

interface ServerService {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  port?: number;
  uptime?: string;
}

interface DevServerStatusProps {
  services: ServerService[];
  title?: string;
}

const statusClass: Record<string, string> = {
  online: 'badge-success',
  degraded: 'badge-warning',
  offline: 'badge-error',
};

const statusDot: Record<string, string> = {
  online: 'bg-success',
  degraded: 'bg-warning',
  offline: 'bg-error',
};

export const DevServerStatus: FC<DevServerStatusProps> = ({
  services,
  title = 'Development servers',
}) => (
  <section className="py-4">
    <h2 className="mb-4 text-xl">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <article
          key={service.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title text-base">{service.name}</h3>
              <span
                className={`${statusDot[service.status] ?? 'bg-base-content/20'} size-3 rounded-full`}
              />
            </div>
            {service.port !== undefined && (
              <p className="font-mono text-sm">localhost:{service.port}</p>
            )}
            {service.uptime && (
              <p className="text-base-content/40 text-xs">
                Up {service.uptime}
              </p>
            )}
            <span
              className={`badge badge-sm w-fit ${
                statusClass[service.status] ?? 'badge-ghost'
              }`}>
              {service.status}
            </span>
          </div>
        </article>
      ))}
    </div>
  </section>
);
