'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface UserMenuProps {
  username: string;
  avatarInitials: string;
  role?: string;
  onSignOut?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
}

export const UserMenu: FC<UserMenuProps> = ({
  username,
  avatarInitials,
  role,
  onSignOut,
  onProfile,
  onSettings,
}) => {
  const [open, setOpen] = useState(false);

  const close = (handler?: () => void) => {
    setOpen(false);
    handler?.();
  };

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="btn btn-ghost gap-3 px-2">
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content w-9 rounded-full">
            <span className="text-sm">{avatarInitials}</span>
          </div>
        </div>
        <span className="hidden text-left md:block">
          <span className="block text-sm font-medium">{username}</span>
          {role && (
            <span className="text-base-content/50 block text-xs">{role}</span>
          )}
        </span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && (
        <div
          role="menu"
          data-testid="user-menu"
          className="bg-base-100 border-base-200 absolute top-full right-0 z-50 mt-2 w-52 rounded-xl border p-1 shadow-xl">
          <button
            type="button"
            role="menuitem"
            onClick={() => close(onProfile)}
            className="hover:bg-base-200 btn btn-ghost w-full justify-start">
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => close(onSettings)}
            className="hover:bg-base-200 btn btn-ghost w-full justify-start">
            Settings
          </button>
          <div className="divider my-1" />
          <button
            type="button"
            role="menuitem"
            data-testid="user-menu-signout"
            onClick={() => close(onSignOut)}
            className="btn btn-ghost hover:bg-error/10 text-error w-full justify-start">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
