import type { FC } from 'react';

interface SuggestionCardProps {
  name: string;
  handle?: string;
  reason?: string;
  avatar?: string;
  onFollow?: () => void;
  onDismiss?: () => void;
}

export const SuggestionCard: FC<SuggestionCardProps> = ({
  name,
  handle,
  reason = 'Suggested for you',
  avatar,
  onFollow,
  onDismiss,
}) => (
  <div
    className="border-base-300 bg-base-200 flex items-center gap-3 rounded-xl border p-3"
    data-testid="suggestion-card">
    <div className="avatar placeholder">
      <div className="bg-secondary text-secondary-content w-10 rounded-full">
        <span>{avatar ?? name.charAt(0).toUpperCase()}</span>
      </div>
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold">{name}</p>
      <p className="text-base-content/50 truncate text-xs">
        {handle ? `@${handle}` : reason}
      </p>
    </div>
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className="btn btn-primary btn-xs"
        onClick={onFollow}>
        Follow
      </button>
      {onDismiss && (
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  </div>
);
