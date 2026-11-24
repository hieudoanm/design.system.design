import type { FC } from 'react';

interface PasswordStrengthProps {
  value: string;
  label?: string;
}

const checks = [
  { id: 'length', label: '8+ characters', test: (v: string) => v.length >= 8 },
  { id: 'lower', label: 'Lowercase', test: (v: string) => /[a-z]/.test(v) },
  { id: 'upper', label: 'Uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'number', label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  {
    id: 'symbol',
    label: 'Symbol',
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

const strengthLabels = [
  'Very weak',
  'Weak',
  'Fair',
  'Good',
  'Strong',
  'Excellent',
];

const barClass = [
  'bg-error',
  'bg-error',
  'bg-warning',
  'bg-warning',
  'bg-success',
  'bg-success',
];

export const PasswordStrength: FC<PasswordStrengthProps> = ({
  value,
  label = 'Password strength',
}) => {
  const score = checks.filter((check) => check.test(value)).length;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-base-content/60 text-xs">{label}</span>
        <span className="text-base-content/70 text-xs font-medium">
          {strengthLabels[score]}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index < score ? barClass[score] : 'bg-base-content/15'
            }`}
          />
        ))}
      </div>
      <ul className="text-base-content/50 grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
        {checks.map((check) => (
          <li
            key={check.id}
            className={check.test(value) ? 'text-success' : ''}>
            {check.test(value) ? '✓' : '•'} {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

PasswordStrength.displayName = 'PasswordStrength';
