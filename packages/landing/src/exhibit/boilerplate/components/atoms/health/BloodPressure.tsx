import type { FC } from 'react';

interface BloodPressureProps {
  systolic: number;
  diastolic: number;
  unit?: string;
  className?: string;
}

const categorize = (systolic: number): string => {
  if (systolic < 90) return 'badge-info';
  if (systolic < 120) return 'badge-success';
  if (systolic < 130) return 'badge-warning';
  return 'badge-error';
};

export const BloodPressure: FC<BloodPressureProps> = ({
  systolic,
  diastolic,
  unit = 'mmHg',
  className = '',
}) => (
  <span
    data-testid="blood-pressure"
    className={`badge ${categorize(systolic)} ${className}`}>
    {systolic}/{diastolic} {unit}
  </span>
);
