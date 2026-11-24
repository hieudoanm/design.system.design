import type { CSSProperties, FC } from 'react';

interface SpacerProps {
  axis?: 'horizontal' | 'vertical';
  size?: number;
  className?: string;
}

export const Spacer: FC<SpacerProps> = ({
  axis = 'horizontal',
  size,
  className = '',
}) => {
  const style: CSSProperties =
    axis === 'horizontal'
      ? { flexGrow: size ? undefined : 1, width: size }
      : { height: size };

  return (
    <div
      aria-hidden="true"
      className={`${axis === 'horizontal' ? 'flex-1' : ''} ${className}`}
      style={style}
    />
  );
};

Spacer.displayName = 'Spacer';
