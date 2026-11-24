import type { FC } from 'react';

interface SectionLabelProps {
  text: string;
  className?: string;
}

export const SectionLabel: FC<SectionLabelProps> = ({
  text,
  className = '',
}) => (
  <span
    data-testid="section-label"
    className={`text-primary text-xs font-semibold tracking-widest uppercase ${className}`}>
    {text}
  </span>
);
