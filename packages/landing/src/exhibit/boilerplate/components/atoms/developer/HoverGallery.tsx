import type { FC } from 'react';

interface GalleryImage {
  src: string;
  alt: string;
}

interface HoverGalleryProps {
  images: GalleryImage[];
  className?: string;
}

export const HoverGallery: FC<HoverGalleryProps> = ({
  images,
  className = '',
}) => (
  <figure className={`hover-gallery ${className}`}>
    {images.map((image) => (
      <img key={image.src} src={image.src} alt={image.alt} />
    ))}
  </figure>
);

HoverGallery.displayName = 'HoverGallery';
