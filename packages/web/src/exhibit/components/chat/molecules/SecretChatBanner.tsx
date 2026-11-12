'use client';

import { type FC } from 'react';
import { FaLock, FaShieldAlt } from 'react-icons/fa';

interface SecretChatBannerProps {
  onVerify?: () => void;
}

export const SecretChatBanner: FC<SecretChatBannerProps> = ({ onVerify }) => (
  <div className="bg-warning/10 border-warning/30 flex items-center gap-3 rounded-xl border px-4 py-3">
    <FaLock className="text-warning h-4 w-4 shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold">Secret Chat</p>
      <p className="text-base-content/60 text-xs">
        Messages are end-to-end encrypted. No one outside this chat can read
        them.
      </p>
    </div>
    {onVerify && (
      <button
        type="button"
        onClick={onVerify}
        className="btn btn-xs btn-ghost gap-1"
        aria-label="Verify encryption">
        <FaShieldAlt className="h-3 w-3" />
        Verify
      </button>
    )}
  </div>
);
