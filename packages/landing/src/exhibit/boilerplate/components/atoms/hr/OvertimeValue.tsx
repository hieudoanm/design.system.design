import type { FC } from 'react';

interface OvertimeValueProps {
  hours: number;
  positive?: boolean;
}

export const OvertimeValue: FC<OvertimeValueProps> = ({
  hours,
  positive = true,
}) => (
  <span
    data-testid="overtime-value"
    className={`text-sm font-semibold ${positive ? 'text-success' : 'text-error'}`}>
    {positive ? '+' : ''}
    {hours}h
  </span>
);
