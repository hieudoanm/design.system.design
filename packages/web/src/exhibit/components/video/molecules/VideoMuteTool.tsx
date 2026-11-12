'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { processVideo } from '@/exhibit/lib/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoMuteTool: FC<{ config: VideoToolConfig }> = ({ config }) => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleMute = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      await processVideo(file, {
        outputName: file.name.replace(/\.[^.]+$/, '-muted.webm'),
      });
    } catch {}
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Mute Video</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <VideoFileUpload accept="video/*" onFile={setFile} />
      {file && <p className="text-base-content/60 text-xs">{file.name}</p>}
      <button
        onClick={handleMute}
        disabled={!file || processing}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Processing...' : 'Mute'}
      </button>
    </div>
  );
};
