'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';

export const GenerateSubtitleTool: FC<{ config: VideoToolConfig }> = ({
  config,
}) => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Generate Subtitles</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <p className="text-base-content/40 text-xs">
        Upload a video to generate subtitles (requires server-side processing).
      </p>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="file-input file-input-bordered file-input-sm w-full max-w-md"
      />
      {file && <p className="text-base-content/60 text-xs">{file.name}</p>}
      <button disabled={!file} className="btn btn-primary btn-sm w-fit">
        Generate Subtitles
      </button>
    </div>
  );
};
