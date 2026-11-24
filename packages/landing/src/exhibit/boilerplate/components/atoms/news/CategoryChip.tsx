import type { FC } from 'react';

interface CategoryChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const CategoryChip: FC<CategoryChipProps> = ({
  label,
  active = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn btn-xs rounded-full ${
      active ? 'btn-primary' : 'btn-ghost border-base-300 border'
    }`}>
    {label}
  </button>
);
