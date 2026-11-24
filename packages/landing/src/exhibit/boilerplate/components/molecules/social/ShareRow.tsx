import type { FC } from 'react';

interface ShareRowProps {
  shares?: number;
  onShare?: () => void;
  onCopy?: () => void;
  onMessage?: () => void;
}

export const ShareRow: FC<ShareRowProps> = ({
  shares = 0,
  onShare,
  onCopy,
  onMessage,
}) => (
  <div
    className="border-base-300 bg-base-200 flex items-center justify-between rounded-xl border p-2"
    data-testid="share-row">
    <span className="text-base-content/60 px-2 text-xs">{shares} shares</span>
    <div className="flex items-center gap-1">
      <button type="button" className="btn btn-ghost btn-sm" onClick={onShare}>
        Share
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onCopy}>
        Copy link
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={onMessage}>
        Message
      </button>
    </div>
  </div>
);
