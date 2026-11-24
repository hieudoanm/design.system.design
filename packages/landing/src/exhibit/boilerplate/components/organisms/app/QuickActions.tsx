'use client';

import type { FC, ReactNode } from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
}

interface QuickActionsProps {
  actions: QuickAction[];
  onAction?: (id: string) => void;
}

const VARIANT_CLASS: Record<NonNullable<QuickAction['variant']>, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
};

export const QuickActions: FC<QuickActionsProps> = ({ actions, onAction }) => (
  <div data-testid="quick-actions" className="flex flex-wrap gap-2">
    {actions.map((action) => (
      <button
        key={action.id}
        type="button"
        data-testid={`quick-action-${action.id}`}
        onClick={() => onAction?.(action.id)}
        className={`btn ${VARIANT_CLASS[action.variant ?? 'ghost']}`}>
        {action.icon && <span>{action.icon}</span>}
        {action.label}
      </button>
    ))}
  </div>
);
