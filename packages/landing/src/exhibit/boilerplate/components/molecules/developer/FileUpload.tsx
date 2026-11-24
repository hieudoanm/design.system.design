'use client';

import { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import type { ChangeEvent, DragEvent, FC } from 'react';

interface UploadedFile {
  name: string;
  size: number;
}

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFilesChange?: (files: UploadedFile[]) => void;
  hint?: string;
}

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

export const FileUpload: FC<FileUploadProps> = ({
  label = 'Upload files',
  accept,
  multiple = false,
  maxSize,
  onFilesChange,
  hint,
}) => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const addFiles = (list: FileList): void => {
    const next = Array.from(list)
      .filter((file) => !maxSize || file.size <= maxSize)
      .map((file) => ({ name: file.name, size: file.size }));
    const merged = multiple ? [...files, ...next] : next;
    setFiles(merged);
    onFilesChange?.(merged);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const removeFile = (name: string): void => {
    const next = files.filter((file) => file.name !== name);
    setFiles(next);
    onFilesChange?.(next);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className={`border-base-content/20 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? 'border-primary bg-primary/10' : 'bg-base-200/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}>
        <FiUpload
          className="text-base-content/40 text-2xl"
          aria-hidden="true"
        />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-base-content/50 text-xs">
          {hint ?? 'Drag and drop or click to browse'}
        </p>
        <input
          id="file-upload-input"
          type="file"
          accept={accept}
          multiple={multiple}
          aria-label={label}
          className="hidden"
          onChange={handleInput}
        />
        <label
          htmlFor="file-upload-input"
          className="btn btn-sm btn-outline mt-1 cursor-pointer">
          Browse
        </label>
      </div>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((file) => (
            <li
              key={file.name}
              className="border-base-content/10 bg-base-200 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="truncate">{file.name}</span>
              <span className="text-base-content/50 shrink-0 text-xs">
                {formatSize(file.size)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                className="btn btn-circle btn-ghost btn-xs"
                onClick={() => removeFile(file.name)}>
                <FiX />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
