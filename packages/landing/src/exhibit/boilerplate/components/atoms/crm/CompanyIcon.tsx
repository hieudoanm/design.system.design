import type { FC } from 'react';

type IconSize = 'sm' | 'md' | 'lg';

interface CompanyIconProps {
  name: string;
  src?: string;
  size?: IconSize;
}

const sizeClass: Record<IconSize, string> = {
  sm: 'w-8 text-xs',
  md: 'w-10 text-sm',
  lg: 'w-12 text-base',
};

const initialOf = (name: string): string => {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : '?';
};

export const CompanyIcon: FC<CompanyIconProps> = ({
  name,
  src,
  size = 'md',
}) => {
  if (src) {
    return (
      <div className={`avatar avatar-placeholder ${sizeClass[size]}`}>
        <img src={src} alt={`${name} logo`} className="rounded-lg" />
      </div>
    );
  }
  return (
    <div className={`avatar avatar-placeholder ${sizeClass[size]}`}>
      <div className="bg-base-200 text-base-content flex aspect-square items-center justify-center rounded-lg font-semibold">
        {initialOf(name)}
      </div>
    </div>
  );
};
