'use client';

import { type FC, useCallback, useRef, useState, type DragEvent } from 'react';
import { FiUpload } from 'react-icons/fi';

interface VideoFileUploadProps {
  accept?: string;
  onFile: (file: File) => void;
}

export const VideoFileUpload: FC<VideoFileUploadProps> = ({
  accept = 'video/*',
  onFile,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      className={`rounded-box border-base-300 flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed p-6 text-center transition-colors ${
        dragging
          ? 'border-primary bg-primary/5'
          : 'hover:border-base-content/30'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}>
      <FiUpload className="size-6 opacity-50" />
      <p className="text-base-content/60 text-xs">
        Drop a file here or click to browse
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};
