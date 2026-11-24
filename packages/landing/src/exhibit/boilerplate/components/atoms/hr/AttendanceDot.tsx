import type { FC } from 'react';

interface AttendanceDotProps {
  status: 'present' | 'late' | 'absent' | 'leave';
  label?: string;
  size?: 'sm' | 'md';
}

const statusClass: Record<AttendanceDotProps['status'], string> = {
  present: 'bg-success',
  late: 'bg-warning',
  absent: 'bg-error',
  leave: 'bg-info',
};

const sizeClass: Record<NonNullable<AttendanceDotProps['size']>, string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
};

export const AttendanceDot: FC<AttendanceDotProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const ariaLabel = label ?? status;
  return (
    <span
      data-testid="attendance-dot"
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-block rounded-full ${statusClass[status]} ${sizeClass[size]}`}
    />
  );
};
