import type { FC } from 'react';

interface Connection {
  id: string;
  name: string;
  handle: string;
  mutuals: number;
  connected?: boolean;
}

interface ConnectionsPageProps {
  connections: Connection[];
  onConnect?: (id: string) => void;
}

export const ConnectionsPage: FC<ConnectionsPageProps> = ({
  connections,
  onConnect,
}) => {
  const connected = connections.filter((item) => item.connected).length;

  return (
    <section data-testid="connections-page" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">People</h2>
          <p className="text-base-content/50 text-sm">
            {connections.length} suggestions
          </p>
        </div>
        <span className="badge badge-success">{connected} connected</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((person) => (
          <article key={person.id} className="card bg-base-200">
            <div className="card-body items-center gap-2 text-center">
              <div className="avatar placeholder">
                <div className="bg-secondary text-secondary-content w-14 rounded-full">
                  <span className="text-lg">{person.name.charAt(0)}</span>
                </div>
              </div>
              <h3 className="text-sm font-medium">{person.name}</h3>
              <p className="text-base-content/50 text-xs">{person.handle}</p>
              <p className="text-base-content/50 text-xs">
                {person.mutuals} mutual connections
              </p>
              <button
                type="button"
                className={`btn btn-sm w-full ${
                  person.connected ? 'btn-outline' : 'btn-primary'
                }`}
                onClick={() => onConnect?.(person.id)}>
                {person.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
