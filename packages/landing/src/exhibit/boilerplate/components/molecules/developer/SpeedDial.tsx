'use client';

import { useState } from 'react';
import type { FC, ReactNode } from 'react';

type SpeedDialPosition =
  'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface SpeedDialAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface SpeedDialProps {
  triggerIcon: ReactNode;
  actions: SpeedDialAction[];
  position?: SpeedDialPosition;
  openLabel?: string;
  closeLabel?: string;
}

const wrapperClass: Record<SpeedDialPosition, string> = {
  'bottom-right': 'bottom-6 right-6 items-end',
  'bottom-left': 'bottom-6 left-6 items-start',
  'top-right': 'top-6 right-6 items-end flex-col-reverse',
  'top-left': 'top-6 left-6 items-start flex-col-reverse',
};

export const SpeedDial: FC<SpeedDialProps> = ({
  triggerIcon,
  actions,
  position = 'bottom-right',
  openLabel = 'Open quick actions',
  closeLabel = 'Close quick actions',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`fixed z-40 flex flex-col gap-2 ${wrapperClass[position]}`}>
      {open && (
        <ul
          role="menu"
          aria-label="Quick actions"
          className="flex flex-col gap-1">
          {actions.map((action) => (
            <li key={action.label} role="none">
              <button
                role="menuitem"
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className="border-base-content/10 bg-base-100 hover:bg-base-200 flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm shadow-lg">
                {action.icon && (
                  <span className="bg-primary text-primary-content btn btn-circle btn-xs">
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="btn btn-primary btn-circle btn-lg shadow-lg">
        {triggerIcon}
      </button>
    </div>
  );
};
