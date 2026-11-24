import type { FC } from 'react';

interface RoomTypeProps {
  label: string;
}

export const RoomType: FC<RoomTypeProps> = ({ label }) => (
  <span className="badge badge-outline" data-testid="room-type">
    {label}
  </span>
);
