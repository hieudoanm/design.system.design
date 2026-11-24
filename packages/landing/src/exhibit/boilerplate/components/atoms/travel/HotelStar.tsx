import type { FC } from 'react';

interface HotelStarProps {
  value: number;
  max?: number;
}

export const HotelStar: FC<HotelStarProps> = ({ value, max = 5 }) => {
  const filled = Math.floor(value);

  return (
    <div
      className="rating rating-xs"
      data-testid="hotel-star"
      aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, index) => (
        <input
          key={index}
          type="radio"
          readOnly
          checked={index < filled}
          className="mask mask-star-2 bg-warning"
        />
      ))}
    </div>
  );
};
