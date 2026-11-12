'use client';

import { type FC, useRef, useCallback } from 'react';
import {
  FaImage,
  FaVideo,
  FaFile,
  FaMicrophone,
  FaSmile,
} from 'react-icons/fa';

interface MediaComposerProps {
  onImageSelect: (file: File) => void;
  onVideoSelect: (file: File) => void;
  onFileSelect: (file: File) => void;
  onVoiceRecord: () => void;
  onStickerToggle: () => void;
}

export const MediaComposer: FC<MediaComposerProps> = ({
  onImageSelect,
  onVideoSelect,
  onFileSelect,
  onVoiceRecord,
  onStickerToggle,
}) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) onImageSelect(file);
      e.target.value = '';
    },
    [onImageSelect]
  );

  const handleVideo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) onVideoSelect(file);
      e.target.value = '';
    },
    [onVideoSelect]
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = '';
    },
    [onFileSelect]
  );

  return (
    <div className="flex items-center gap-1">
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        onChange={handleImage}
        className="hidden"
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        onChange={handleVideo}
        className="hidden"
      />
      <input
        ref={fileRef}
        type="file"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => imageRef.current?.click()}
        aria-label="Send image"
        className="btn btn-circle btn-xs btn-ghost"
        title="Image">
        <FaImage aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => videoRef.current?.click()}
        aria-label="Send video"
        className="btn btn-circle btn-xs btn-ghost"
        title="Video">
        <FaVideo aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        aria-label="Send file"
        className="btn btn-circle btn-xs btn-ghost"
        title="File">
        <FaFile aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onVoiceRecord}
        aria-label="Voice message"
        className="btn btn-circle btn-xs btn-ghost"
        title="Voice message">
        <FaMicrophone aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onStickerToggle}
        aria-label="Stickers"
        className="btn btn-circle btn-xs btn-ghost"
        title="Stickers">
        <FaSmile aria-hidden="true" />
      </button>
    </div>
  );
};
