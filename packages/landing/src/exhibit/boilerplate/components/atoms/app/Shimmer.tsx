import type { CSSProperties, FC } from 'react';

interface ShimmerProps {
  className?: string;
  rounded?: string;
}

export const Shimmer: FC<ShimmerProps> = ({
  className = '',
  rounded = 'rounded-lg',
}) => (
  <>
    <style>
      {`@keyframes hv-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}
    </style>
    <div
      aria-hidden="true"
      className={`bg-base-content/10 relative overflow-hidden ${rounded} ${className}`}
      style={
        {
          backgroundImage:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)',
          backgroundSize: '200% 100%',
          animation: 'hv-shimmer 1.6s linear infinite',
        } as CSSProperties
      }
    />
  </>
);

Shimmer.displayName = 'Shimmer';
