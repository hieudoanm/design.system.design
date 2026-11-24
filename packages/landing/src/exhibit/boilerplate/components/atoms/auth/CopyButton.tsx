'use client';

import { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';
import type { FC } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onCopy?: () => void;
}

export const CopyButton: FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  variant = 'outline',
  size = 'sm',
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={`btn btn-${variant} btn-${size}`}
      onClick={handleCopy}>
      {copied ? <FiCheck /> : <FiCopy />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
};
