import type { FC } from 'react';

interface Pin {
  id: string;
  name: string;
  type: 'food' | 'sight' | 'hotel' | 'activity';
  coordinates: string;
}

interface MapExplorerProps {
  pins: Pin[];
  onSelect?: (id: string) => void;
}

const TYPE_BADGE: Record<Pin['type'], string> = {
  food: 'badge-warning',
  sight: 'badge-primary',
  hotel: 'badge-secondary',
  activity: 'badge-accent',
};

export const MapExplorer: FC<MapExplorerProps> = ({ pins, onSelect }) => {
  return (
    <section data-testid="map-explorer" className="flex flex-col gap-4">
      <div className="bg-primary/10 relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(45deg, transparent 49%, #00000022 50%, transparent 51%)',
          }}
        />
        <span className="text-base-content/40 text-sm">Map area</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Nearby places</h2>
          <span className="badge badge-ghost">{pins.length} pins</span>
        </div>
        <ul className="flex flex-col gap-2">
          {pins.length === 0 && (
            <li className="text-base-content/60 text-sm">No pins yet</li>
          )}
          {pins.map((pin) => (
            <li key={pin.id}>
              <button
                type="button"
                className="card card-side bg-base-200 w-full items-center"
                onClick={() => onSelect?.(pin.id)}>
                <div className="card-body flex-row items-center gap-3 p-3">
                  <span className={`badge ${TYPE_BADGE[pin.type]}`}>
                    {pin.type}
                  </span>
                  <span className="text-sm font-medium">{pin.name}</span>
                  <span className="text-base-content/50 ml-auto text-xs">
                    {pin.coordinates}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
