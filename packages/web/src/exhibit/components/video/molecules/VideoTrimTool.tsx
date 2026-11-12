'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { processVideo } from '@/exhibit/lib/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoTrimTool: FC<{ config: VideoToolConfig }> = ({ config }) => {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);

  const handleLoad = (f: File) => {
    setFile(f);
    const v = document.createElement('video');
    v.src = URL.createObjectURL(f);
    v.onloadedmetadata = () => {
      setDuration(v.duration);
      setEndTime(v.duration);
      URL.revokeObjectURL(v.src);
    };
  };

  const handleTrim = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      await processVideo(file, {
        startTime,
        endTime,
        outputName: file.name.replace(/\.[^.]+$/, '-trimmed.webm'),
      });
    } catch {
      /* ignore */
    }
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Trim Video</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <VideoFileUpload accept="video/*" onFile={handleLoad} />
      {file && (
        <>
          <p className="text-base-content/60 text-xs">
            {file.name} ({duration.toFixed(1)}s)
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs">Start:</label>
            <input
              type="number"
              min={0}
              max={endTime}
              step={0.1}
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              className="input input-bordered input-xs w-20"
            />
            <label className="text-xs">End:</label>
            <input
              type="number"
              min={startTime}
              max={duration}
              step={0.1}
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
              className="input input-bordered input-xs w-20"
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={endTime}
            onChange={(e) => setEndTime(Number(e.target.value))}
            className="range range-xs max-w-md"
          />
        </>
      )}
      <button
        onClick={handleTrim}
        disabled={!file || processing || startTime >= endTime}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Trimming...' : 'Trim'}
      </button>
    </div>
  );
};
