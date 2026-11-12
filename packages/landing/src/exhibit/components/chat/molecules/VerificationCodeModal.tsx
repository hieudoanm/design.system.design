'use client';

import { type FC } from 'react';
import { FaTimes, FaShieldAlt } from 'react-icons/fa';
import type { VerificationCode } from '@/exhibit/types/chat';

interface VerificationCodeModalProps {
  verification: VerificationCode;
  onClose: () => void;
}

const formatCode = (code: string): string => {
  const parts: string[] = [];
  for (let i = 0; i < code.length; i += 2) {
    parts.push(code.slice(i, i + 2));
  }
  return parts.join(' ');
};

export const VerificationCodeModal: FC<VerificationCodeModalProps> = ({
  verification,
  onClose,
}) => {
  const expiresSoon = verification.expiresAt - Date.now() < 2 * 60 * 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-base-100 border-base-300 mx-4 w-full max-w-sm rounded-2xl border p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-primary h-5 w-5" />
            <h2 className="text-lg font-bold">Verify Encryption</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-xs btn-ghost"
            aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <p className="text-base-content/60 mb-4 text-sm">
          Compare this code with your contact to verify your chat is secure.
          Both of you should see the same code.
        </p>
        <div className="bg-base-200 mb-4 rounded-xl p-4 text-center">
          <p className="text-primary mb-1 font-mono text-3xl font-bold tracking-widest">
            {formatCode(verification.code)}
          </p>
          {expiresSoon && (
            <p className="text-warning text-xs">
              Code expires soon — verify quickly
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary w-full">
          Done
        </button>
      </div>
    </div>
  );
};
