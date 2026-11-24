import type { FC, ReactNode } from 'react';

interface ImageCaptionProps {
  children: ReactNode;
  credit?: string;
}

export const ImageCaption: FC<ImageCaptionProps> = ({ children, credit }) => (
  <figcaption
    className="text-base-content/50 mt-2 text-sm"
    data-testid="image-caption">
    {children}
    {credit && <span className="text-base-content/40"> - {credit}</span>}
  </figcaption>
);
