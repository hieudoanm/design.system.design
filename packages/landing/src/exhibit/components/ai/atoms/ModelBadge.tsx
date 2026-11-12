'use client';

import { type FC, useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

interface ModelBadgeProps {
  model: string;
  badge: string;
  badgeColor: string;
}

export const ModelBadge: FC<ModelBadgeProps> = ({ badge, badgeColor }) => (
  <span className={`badge ${badgeColor} badge-sm`}>{badge}</span>
);

interface CopyButtonProps {
  text: string;
  label?: string;
}

export const CopyButton: FC<CopyButtonProps> = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* empty */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-ghost btn-xs"
      title={label}>
      {copied ? <FiCheck className="size-3" /> : <FiCopy className="size-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
};

interface SkeletonProps {
  lines?: number;
}

export const Skeleton: FC<SkeletonProps> = ({ lines = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="skeleton h-4 w-full" />
    ))}
  </div>
);
