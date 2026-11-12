import { type FC } from 'react';
import type { PosView } from '@/exhibit/components/pos/types';

export const POS_VIEWS: { view: PosView; label: string }[] = [
  { view: 'history', label: 'History' },
  { view: 'daily', label: 'Daily' },
  { view: 'reports', label: 'Reports' },
  { view: 'inventory', label: 'Inventory' },
  { view: 'tax', label: 'Tax' },
  { view: 'discounts', label: 'Discounts' },
  { view: 'gift-cards', label: 'Gift Cards' },
  { view: 'users', label: 'Users' },
  { view: 'shifts', label: 'Shifts' },
];

interface ViewToolbarProps {
  onSelect: (view: PosView) => void;
}

export const ViewToolbar: FC<ViewToolbarProps> = ({ onSelect }) => (
  <div className="flex flex-wrap items-center gap-2 pb-4">
    {POS_VIEWS.map(({ view, label }) => (
      <button
        key={view}
        className="btn btn-ghost btn-xs"
        onClick={() => onSelect(view)}>
        {label}
      </button>
    ))}
  </div>
);
