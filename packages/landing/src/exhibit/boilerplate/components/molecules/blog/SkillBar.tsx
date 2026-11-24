import type { FC } from 'react';
import { Progress } from '../../atoms/app/Progress';

interface SkillBarProps {
  label: string;
  value: number;
  max?: number;
  variant?:
    'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  className?: string;
}

export const SkillBar: FC<SkillBarProps> = ({
  label,
  value,
  max = 100,
  variant = 'primary',
  showValue = true,
  className = '',
}) => (
  <div className={`flex w-full flex-col gap-1 ${className}`}>
    <Progress
      label={label}
      value={value}
      max={max}
      variant={variant}
      size="sm"
      showValue={showValue}
    />
  </div>
);

SkillBar.displayName = 'SkillBar';
