'use client';

import type { FC } from 'react';
import { useRef, useState } from 'react';
import { FiFile, FiUpload, FiX } from 'react-icons/fi';

interface SelectedFile {
  name: string;
  size: number;
}

type UploadStatus = 'idle' | 'uploading' | 'done';

const formatSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  return `${(size / 1024).toFixed(1)} KB`;
};

export const UploadTemplate: FC = () => {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (files: FileList | null) => {
    const selected = files?.[0];
    if (selected) {
      setFile({ name: selected.name, size: selected.size });
      setStatus('idle');
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setStatus('uploading');
    timeoutRef.current = setTimeout(() => setStatus('done'), 1200);
  };

  const handleReset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFile(null);
    setStatus('idle');
  };

  const getUploadLabel = (): string => {
    if (status === 'uploading') return 'Uploading...';
    if (status === 'done') return 'Upload complete';
    return 'Upload';
  };

  return (
    <div className="bg-base-100 text-base-content flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Upload
          </p>
          <h1>Upload</h1>
          <p className="text-base-content/50 text-sm">
            Pick a file, preview it, then upload.
          </p>
        </div>

        <div className="card border-base-content/10 bg-base-200 border">
          <div className="card-body p-5">
            <label
              htmlFor="upload-file"
              className="border-base-content/20 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center">
              <FiUpload className="text-base-content/40 h-8 w-8" />
              {file ? (
                <span className="font-medium">{file.name}</span>
              ) : (
                <>
                  <span className="font-medium">Drop a file here</span>
                  <span className="text-base-content/50 text-sm">
                    or click browse to pick one from your device
                  </span>
                </>
              )}
              <span className="btn btn-neutral btn-sm">Browse</span>
            </label>
            <input
              id="upload-file"
              type="file"
              aria-label="Choose file"
              className="hidden"
              onChange={(e) => handleChange(e.target.files)}
            />

            {file && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-base-300/50 rounded-lg p-2">
                    <FiFile className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-base-content/50 text-sm">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={status === 'uploading'}
                    className="btn btn-primary btn-sm gap-1">
                    <FiUpload className="h-4 w-4" />
                    {getUploadLabel()}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-ghost btn-sm gap-1">
                    <FiX className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

UploadTemplate.displayName = 'UploadTemplate';
