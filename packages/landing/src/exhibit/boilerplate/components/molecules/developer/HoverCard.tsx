import type { FC, ReactNode } from 'react';

type HoverCardSide = 'top' | 'bottom' | 'left' | 'right';

interface HoverCardProps {
  trigger: ReactNode;
  content: ReactNode;
  side?: HoverCardSide;
  widthClass?: string;
  className?: string;
}

const sideClass: Record<HoverCardSide, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

export const HoverCard: FC<HoverCardProps> = ({
  trigger,
  content,
  side = 'bottom',
  widthClass = 'w-64',
  className = '',
}) => (
  <div className={`group relative inline-flex ${className}`} tabIndex={0}>
    {trigger}
    <div
      role="tooltip"
      className={`border-base-content/10 bg-base-100 pointer-events-none absolute z-20 hidden rounded-xl border p-3 shadow-lg group-focus-within:block group-hover:block ${sideClass[side]} ${widthClass}`}>
      {content}
    </div>
  </div>
);
