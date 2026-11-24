import type { FC } from 'react';

interface CaptionTextProps {
  text: string;
  className?: string;
}

export const CaptionText: FC<CaptionTextProps> = ({ text, className = '' }) => (
  <span
    data-testid="caption-text"
    className={`text-base-content/50 text-sm ${className}`}>
    {text}
  </span>
);
