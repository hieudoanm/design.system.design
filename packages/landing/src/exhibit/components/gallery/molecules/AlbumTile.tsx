import { type FC } from 'react';
import Link from 'next/link';
import { FiImage } from 'react-icons/fi';
import type { Album, Photo } from '@/exhibit/types/gallery';
import { PhotoThumb } from '@/exhibit/components/gallery/atoms/PhotoThumb';
import { gradientFor } from '@/exhibit/utils/gallery/format';

interface AlbumTileProps {
  album: Album;
  cover?: Photo;
}

export const AlbumTile: FC<AlbumTileProps> = ({ album, cover }) => (
  <Link
    href={`/design-system/exhibits/gallery`}
    aria-label={album.name}
    className="group bg-base-200 block overflow-hidden rounded-xl">
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      {cover ? (
        <PhotoThumb photo={cover} className="h-full w-full" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: gradientFor('#475569') }}>
          <FiImage className="size-8 text-white/40" />
        </div>
      )}
      <span className="absolute top-2 left-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-medium text-white">
        {album.photoIds.length}
      </span>
    </div>
    <div className="p-3">
      <h3 className="truncate text-sm font-semibold">{album.name}</h3>
      <p className="text-base-content/50 text-xs">
        {album.photoIds.length}{' '}
        {album.photoIds.length === 1 ? 'photo' : 'photos'}
      </p>
    </div>
  </Link>
);
