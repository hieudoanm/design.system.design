import type { FC } from 'react';

interface MaskProps {
  src: string;
  alt: string;
  shape?:
    | 'squircle'
    | 'heart'
    | 'hexagon'
    | 'hexagon-2'
    | 'decagon'
    | 'triangle'
    | 'star';
  className?: string;
}

const shapeClass: Record<NonNullable<MaskProps['shape']>, string> = {
  squircle: 'mask-squircle',
  heart: 'mask-heart',
  hexagon: 'mask-hexagon',
  'hexagon-2': 'mask-hexagon-2',
  decagon: 'mask-decagon',
  triangle: 'mask-triangle',
  star: 'mask-star',
};

export const Mask: FC<MaskProps> = ({
  src,
  alt,
  shape = 'squircle',
  className = '',
}) => (
  <img
    src={src}
    alt={alt}
    className={`mask ${shapeClass[shape]} ${className}`}
  />
);
