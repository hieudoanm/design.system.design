import type { FC, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const positionClass: Record<NonNullable<TooltipProps['position']>, string> = {
  top: 'tooltip',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
};

export const Tooltip: FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => (
  <span className={`tooltip ${positionClass[position]}`} data-tip={content}>
    {children}
  </span>
);
