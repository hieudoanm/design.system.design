import type { FC, ReactNode } from 'react';

interface IndicatorProps {
  badge: ReactNode;
  children: ReactNode;
  position?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
}

const positionClass: Record<NonNullable<IndicatorProps['position']>, string> = {
  'top-end': 'indicator-top indicator-end',
  'top-start': 'indicator-top indicator-start',
  'bottom-end': 'indicator-bottom indicator-end',
  'bottom-start': 'indicator-bottom indicator-start',
};

export const Indicator: FC<IndicatorProps> = ({
  badge,
  children,
  position = 'top-end',
}) => (
  <div className="indicator">
    <span
      className={`indicator-item badge badge-sm ${positionClass[position]}`}>
      {badge}
    </span>
    {children}
  </div>
);
