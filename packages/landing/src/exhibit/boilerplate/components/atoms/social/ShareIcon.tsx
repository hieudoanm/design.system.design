import type { FC } from 'react';

interface ShareIconProps {
  label?: string;
  onClick?: () => void;
}

export const ShareIcon: FC<ShareIconProps> = ({ label = 'Share', onClick }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="btn btn-ghost btn-circle btn-sm"
    data-testid="share-icon">
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M12 3v10m0-10L8 7m4-4l4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  </button>
);
