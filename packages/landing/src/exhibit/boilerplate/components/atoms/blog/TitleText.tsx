import type { FC, ReactNode } from 'react';

interface TitleTextProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const levelClass: Record<NonNullable<TitleTextProps['level']>, string> = {
  1: 'text-4xl',
  2: 'text-3xl',
  3: 'text-2xl',
  4: 'text-xl',
  5: 'text-lg',
  6: 'text-base',
};

export const TitleText: FC<TitleTextProps> = ({
  children,
  level = 2,
  className = '',
}) => {
  const Tag = `h${level}` as const;
  return (
    <Tag
      data-testid="title-text"
      className={`font-bold tracking-tight ${levelClass[level]} ${className}`}>
      {children}
    </Tag>
  );
};
