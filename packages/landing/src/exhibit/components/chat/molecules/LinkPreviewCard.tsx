'use client';

import { type FC } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import type { LinkPreview } from '@/exhibit/types/chat';

interface LinkPreviewCardProps {
  preview: LinkPreview;
}

export const LinkPreviewCard: FC<LinkPreviewCardProps> = ({ preview }) => (
  <a
    href={preview.url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-base-200/60 border-base-300 hover:bg-base-200 mt-1 block overflow-hidden rounded-xl border transition-colors">
    {preview.image && (
      <img
        src={preview.image}
        alt={preview.title}
        className="h-28 w-full object-cover"
      />
    )}
    <div className="p-2.5">
      <p className="text-base-content/50 text-[10px] uppercase">
        {preview.siteName}
      </p>
      <p className="line-clamp-2 text-sm font-semibold">{preview.title}</p>
      <p className="text-base-content/60 line-clamp-2 text-xs">
        {preview.description}
      </p>
      <span className="text-primary mt-1 inline-flex items-center gap-1 text-[10px]">
        <FaExternalLinkAlt aria-hidden="true" />
        {new URL(preview.url).hostname}
      </span>
    </div>
  </a>
);
