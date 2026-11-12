import { type FC, type ReactNode } from 'react';
import { Money } from '@/exhibit/components/pos/atoms';

interface MoneyRowProps {
  label: ReactNode;
  amount: number;
  tone?: 'default' | 'primary' | 'success' | 'error';
  className?: string;
}

const TONE_CLASS: Record<NonNullable<MoneyRowProps['tone']>, string> = {
  default: '',
  primary: 'text-primary',
  success: 'text-success',
  error: 'text-error',
};

export const MoneyRow: FC<MoneyRowProps> = ({
  label,
  amount,
  tone = 'default',
  className = '',
}) => (
  <div className={`flex items-center justify-between ${className}`.trim()}>
    <span className="text-sm font-bold">{label}</span>
    <Money
      amount={amount}
      mono
      className={`text-sm font-bold ${TONE_CLASS[tone]}`}
    />
  </div>
);
