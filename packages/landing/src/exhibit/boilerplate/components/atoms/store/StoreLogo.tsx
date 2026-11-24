import type { FC } from 'react';

interface StoreLogoProps {
  name: string;
  src?: string;
  size?: number;
}

export const StoreLogo: FC<StoreLogoProps> = ({ name, src, size = 40 }) =>
  src ? (
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className="rounded-full"
      data-testid="store-logo-img"
    />
  ) : (
    <span
      className="bg-secondary text-secondary-content flex items-center justify-center rounded-full font-bold"
      style={{ width: size, height: size }}
      data-testid="store-logo-fallback">
      {name.charAt(0).toUpperCase()}
    </span>
  );
