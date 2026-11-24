import type { CSSProperties, FC } from 'react';

interface CountdownProps {
  value: number;
  minDigits?: number;
  className?: string;
}

export const Countdown: FC<CountdownProps> = ({
  value,
  minDigits = 2,
  className = '',
}) => {
  const padded = String(Math.max(0, Math.floor(value))).padStart(
    minDigits,
    '0'
  );

  return (
    <span className={`countdown font-mono tabular-nums ${className}`}>
      <span style={{ '--value': value } as CSSProperties}>{padded}</span>
    </span>
  );
};
