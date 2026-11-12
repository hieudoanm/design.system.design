'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { processVideo } from '@/exhibit/lib/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoSpeedTool: FC<{ config: VideoToolConfig }> = ({ config }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rate, setRate] = useState(1);
  const [processing, setProcessing] = useState(false);

  const handleSpeed = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      await processVideo(file, {
        playbackRate: rate,
        outputName: file.name.replace(/\.[^.]+$/, `-${rate}x.webm`),
      });
    } catch {}
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Speed Changer</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <VideoFileUpload accept="video/*" onFile={setFile} />
      {file && (
        <div className="flex max-w-xs flex-col gap-1">
          <label className="text-xs">Speed: {rate}x</label>
          <input
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="range range-xs"
          />
        </div>
      )}
      <button
        onClick={handleSpeed}
        disabled={!file || processing}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Processing...' : 'Change Speed'}
      </button>
    </div>
  );
};
