import type { FC } from 'react';

interface BulletPointProps {
  text: string;
  icon?: string;
}

export const BulletPoint: FC<BulletPointProps> = ({ text, icon = '✓' }) => (
  <li data-testid="bullet-point" className="flex list-none items-start gap-2">
    <span className="text-primary leading-relaxed" aria-hidden="true">
      {icon}
    </span>
    <span>{text}</span>
  </li>
);
