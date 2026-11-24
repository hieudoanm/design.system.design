import type { FC } from 'react';

interface CubeProps {
  size?: number;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

const SPEED: Record<NonNullable<CubeProps['speed']>, string> = {
  slow: '8s',
  normal: '5s',
  fast: '3s',
};

const FACES: { transform: string; shade: string }[] = [
  { transform: 'rotateY(0deg)', shade: 'bg-primary/90' },
  { transform: 'rotateY(90deg)', shade: 'bg-primary/70' },
  { transform: 'rotateY(180deg)', shade: 'bg-primary/40' },
  { transform: 'rotateY(270deg)', shade: 'bg-primary/50' },
  { transform: 'rotateX(90deg)', shade: 'bg-primary/80' },
  { transform: 'rotateX(270deg)', shade: 'bg-primary/60' },
];

export const Cube: FC<CubeProps> = ({
  size = 96,
  speed = 'normal',
  className = '',
}) => {
  const half = size / 2;

  return (
    <div
      role="img"
      aria-label="Spinning cube"
      className={`relative ${className}`}
      style={{ width: size, height: size, perspective: size * 3 }}>
      <div className="h-full w-full [transform:rotateX(-24deg)_rotateY(32deg)] [transform-style:preserve-3d]">
        <div
          className="h-full w-full animate-spin [transform-style:preserve-3d]"
          style={{ animationDuration: SPEED[speed] }}>
          {FACES.map((face) => (
            <div
              key={face.transform}
              className={`absolute inset-0 ${face.shade} rounded-md [backface-visibility:hidden]`}
              style={{ transform: `${face.transform} translateZ(${half}px)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
