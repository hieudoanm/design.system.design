'use client';

import type { FC } from 'react';

interface ThemeControllerProps {
  theme: string;
  checked?: boolean;
  label?: string;
  onChange?: (checked: boolean, theme: string) => void;
}

export const ThemeController: FC<ThemeControllerProps> = ({
  theme,
  checked = false,
  label,
  onChange,
}) => (
  <label className="flex cursor-pointer items-center gap-2">
    <input
      type="checkbox"
      className="theme-controller"
      value={theme}
      checked={checked}
      onChange={(event) => onChange?.(event.target.checked, theme)}
    />
    {label && <span className="label-text">{label}</span>}
  </label>
);

ThemeController.displayName = 'ThemeController';
