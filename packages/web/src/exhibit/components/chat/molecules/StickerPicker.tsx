'use client';

import { type FC, useState, useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import { STICKER_PACKS, GIFS } from '@/exhibit/data/chat/stickers';

interface StickerPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const StickerPicker: FC<StickerPickerProps> = ({
  onSelect,
  onClose,
}) => {
  const [tab, setTab] = useState<'stickers' | 'gifs'>('stickers');
  const [packId, setPackId] = useState(STICKER_PACKS[0].id);
  const [search] = useState('');

  const currentPack = useMemo(
    () => STICKER_PACKS.find((p) => p.id === packId) ?? STICKER_PACKS[0],
    [packId]
  );

  const filteredStickers = useMemo(() => {
    if (search.trim() === '') return currentPack.stickers;
    return currentPack.stickers;
  }, [currentPack, search]);

  return (
    <div className="bg-base-100 border-base-300 absolute bottom-full left-0 mb-2 w-80 rounded-xl border shadow-xl">
      <div className="border-base-300 flex items-center gap-2 border-b px-3 py-2">
        <h3 className="flex-1 text-sm font-semibold">Stickers</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="btn btn-xs btn-ghost">
          <FaTimes aria-hidden="true" />
        </button>
      </div>
      <div role="tablist" className="tabs tabs-bordered tabs-sm px-2">
        <button
          type="button"
          role="tab"
          onClick={() => setTab('stickers')}
          aria-selected={tab === 'stickers'}
          className={`tab tab-sm ${tab === 'stickers' ? 'tab-active' : ''}`}>
          Stickers
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => setTab('gifs')}
          aria-selected={tab === 'gifs'}
          className={`tab tab-sm ${tab === 'gifs' ? 'tab-active' : ''}`}>
          GIFs
        </button>
      </div>
      {tab === 'stickers' ? (
        <>
          <div className="flex gap-1 overflow-x-auto px-2 py-1.5">
            {STICKER_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => setPackId(pack.id)}
                className={`badge badge-sm shrink-0 ${packId === pack.id ? 'badge-primary' : 'badge-ghost'}`}>
                {pack.name}
              </button>
            ))}
          </div>
          <div className="grid max-h-48 grid-cols-6 gap-1 overflow-y-auto p-2">
            {filteredStickers.map((sticker) => (
              <button
                key={sticker}
                type="button"
                onClick={() => onSelect(sticker)}
                className="btn btn-ghost btn-sm text-xl">
                {sticker}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="grid max-h-48 grid-cols-3 gap-1 overflow-y-auto p-2">
          {GIFS.map((gif) => (
            <button
              key={gif.id}
              type="button"
              onClick={() => onSelect(gif.url)}
              className="aspect-square overflow-hidden rounded-lg">
              <img
                src={gif.url}
                alt={gif.label}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
