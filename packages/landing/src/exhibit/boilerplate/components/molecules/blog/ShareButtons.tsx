'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface ShareButtonsProps {
  url: string;
  title?: string;
  onShare?: (network: string) => void;
}

const networks = ['Twitter', 'Facebook', 'LinkedIn', 'Email'];

export const ShareButtons: FC<ShareButtonsProps> = ({
  url,
  title = '',
  onShare,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(url).catch(() => setCopied(false));
    setCopied(true);
    onShare?.('Copy');
  };

  return (
    <div
      data-testid="share-buttons"
      className="flex flex-wrap items-center gap-2">
      <span className="text-base-content/60 text-sm">{title}</span>
      {networks.map((network) => (
        <button
          key={network}
          type="button"
          onClick={() => onShare?.(network)}
          className="btn btn-outline btn-sm">
          {network}
        </button>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline'}`}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
};

ShareButtons.displayName = 'ShareButtons';
