import type { FC } from 'react';

interface AmenityListProps {
  amenities: string[];
  title?: string;
}

export const AmenityList: FC<AmenityListProps> = ({
  amenities,
  title = 'Amenities',
}) => (
  <div data-testid="amenity-list">
    <h3 className="text-sm font-medium">{title}</h3>
    <ul className="mt-2 flex flex-wrap gap-2">
      {amenities.map((amenity) => (
        <li key={amenity} className="badge badge-outline gap-1">
          <span className="text-success">✓</span>
          {amenity}
        </li>
      ))}
    </ul>
  </div>
);
