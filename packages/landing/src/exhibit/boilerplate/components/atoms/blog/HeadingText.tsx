import type { FC, ReactNode } from 'react';

interface HeadingTextProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const levelClass: Record<NonNullable<HeadingTextProps['level']>, string> = {
  1: 'text-4xl',
  2: 'text-3xl',
  3: 'text-2xl',
  4: 'text-xl',
  5: 'text-lg',
  6: 'text-base',
};

export const HeadingText: FC<HeadingTextProps> = ({
  children,
  level = 2,
  className = '',
}) => {
  const Tag = `h${level}` as const;
  return (
    <Tag
      data-testid="heading-text"
      className={`font-light tracking-tight ${levelClass[level]} ${className}`}>
      {children}
    </Tag>
  );
};
