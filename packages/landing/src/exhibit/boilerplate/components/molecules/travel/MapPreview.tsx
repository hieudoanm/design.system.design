import type { FC } from 'react';

interface MapPreviewProps {
  placeName: string;
  address?: string;
  label?: string;
}

export const MapPreview: FC<MapPreviewProps> = ({
  placeName,
  address,
  label = 'Map preview',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="map-preview">
    <figure className="bg-base-200 relative flex h-40 items-center justify-center">
      <span className="badge badge-neutral absolute top-3 left-3">{label}</span>
      <span className="text-3xl">📍</span>
    </figure>
    <div className="card-body gap-1">
      <h3 className="card-title text-base">{placeName}</h3>
      {address && <p className="text-base-content/60 text-sm">{address}</p>}
    </div>
  </div>
);
