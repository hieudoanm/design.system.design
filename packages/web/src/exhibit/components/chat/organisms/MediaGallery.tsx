'use client';

import { type FC, useState, useMemo } from 'react';
import { FaTimes, FaImage, FaVideo, FaMusic, FaFile } from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import { formatChatTime } from '@/exhibit/lib/chat/format';
import { ImageLightbox } from '@/exhibit/components/chat/organisms/ImageLightbox';

interface MediaGalleryProps {
  chatId: string;
  onClose: () => void;
}

type MediaTab = 'images' | 'videos' | 'audio' | 'files';

export const MediaGallery: FC<MediaGalleryProps> = ({ chatId, onClose }) => {
  const { getMediaMessages } = useData();
  const [tab, setTab] = useState<MediaTab>('images');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const mediaMessages = useMemo(
    () => getMediaMessages(chatId),
    [getMediaMessages, chatId]
  );

  const filtered = useMemo(() => {
    switch (tab) {
      case 'images':
        return mediaMessages.filter((m) => m.type === 'image');
      case 'videos':
        return mediaMessages.filter((m) => m.type === 'video');
      case 'audio':
        return mediaMessages.filter((m) => m.type === 'audio');
      case 'files':
        return mediaMessages.filter((m) => m.type === 'file');
    }
  }, [mediaMessages, tab]);

  const imageUrls = useMemo(
    () =>
      mediaMessages
        .filter((m) => m.type === 'image' && m.mediaUrl)
        .map((m) => m.mediaUrl!),
    [mediaMessages]
  );

  const tabs: { id: MediaTab; icon: typeof FaImage; label: string }[] = [
    { id: 'images', icon: FaImage, label: 'Images' },
    { id: 'videos', icon: FaVideo, label: 'Videos' },
    { id: 'audio', icon: FaMusic, label: 'Audio' },
    { id: 'files', icon: FaFile, label: 'Files' },
  ];

  return (
    <div className="border-base-300 bg-base-100 flex h-full w-full flex-col border-r md:w-80">
      <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
        <h2 className="flex-1 font-semibold">Media</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="btn btn-xs btn-ghost">
          <FaTimes aria-hidden="true" />
        </button>
      </div>
      <div role="tablist" className="tabs tabs-bordered px-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            onClick={() => setTab(t.id)}
            aria-selected={tab === t.id}
            className={`tab tab-md gap-1 ${tab === t.id ? 'tab-active' : ''}`}>
            <t.icon aria-hidden="true" className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-base-content/50 text-sm">No {tab} yet</p>
          </div>
        ) : tab === 'images' ? (
          <div className="grid grid-cols-3 gap-1">
            {filtered.map((msg, i) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={msg.mediaUrl}
                  alt={msg.text || 'Image'}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((msg) => (
              <div key={msg.id} className="bg-base-200 rounded-lg p-3">
                {msg.type === 'video' && msg.mediaUrl && (
                  <video
                    src={msg.mediaUrl}
                    controls
                    className="mb-2 w-full rounded"
                  />
                )}
                {msg.type === 'audio' && msg.mediaUrl && (
                  <audio src={msg.mediaUrl} controls className="mb-2 w-full" />
                )}
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm">
                    {msg.fileName || msg.text}
                  </span>
                  <span className="text-base-content/50 shrink-0 text-xs">
                    {formatChatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {lightboxIndex !== null && (
        <ImageLightbox
          images={imageUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};
