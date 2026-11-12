'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';

export const VideoDownloadTool: FC<{ config: VideoToolConfig }> = ({
  config,
}) => {
  const [url, setUrl] = useState('');

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">{config.platform} Download</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <p className="text-base-content/40 text-xs">
        Paste a {config.platform} video URL to download via server-side
        component.
      </p>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={`https://${config.platform!.toLowerCase()}.com/...`}
        className="input input-bordered input-sm w-full max-w-md"
      />
      <button
        onClick={() => {}}
        disabled={!url}
        className="btn btn-primary btn-sm w-fit">
        Download
      </button>
    </div>
  );
};
