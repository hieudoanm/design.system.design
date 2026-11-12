'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { processVideo } from '@/exhibit/lib/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoCompressTool: FC<{ config: VideoToolConfig }> = ({
  config,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.5);
  const [processing, setProcessing] = useState(false);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      await new Promise((r) => {
        video.onloadedmetadata = r;
      });
      const scale = quality < 0.5 ? 0.5 : 1;
      await processVideo(file, {
        canvas: {
          width: Math.round(video.videoWidth * scale),
          height: Math.round(video.videoHeight * scale),
        },
        mimeType: 'video/webm;codecs=vp8,opus',
        outputName: file.name.replace(/\.[^.]+$/, '-compressed.webm'),
      });
      URL.revokeObjectURL(video.src);
    } catch {}
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Compress Video</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <VideoFileUpload accept="video/*" onFile={setFile} />
      {file && (
        <div className="flex max-w-xs flex-col gap-1">
          <label className="text-xs">
            Quality: {Math.round(quality * 100)}%
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="range range-xs"
          />
        </div>
      )}
      <button
        onClick={handleCompress}
        disabled={!file || processing}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Compressing...' : 'Compress'}
      </button>
    </div>
  );
};
