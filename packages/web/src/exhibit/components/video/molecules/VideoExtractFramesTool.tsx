'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { downloadBlob } from '@/exhibit/lib/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoExtractFramesTool: FC<{ config: VideoToolConfig }> = ({
  config,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(1);
  const [processing, setProcessing] = useState(false);

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      await new Promise((r) => {
        video.onloadedmetadata = r;
      });
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      const interval = 1 / fps;
      for (let t = 0; t < video.duration; t += interval) {
        video.currentTime = t;
        await new Promise((r) => {
          video.onseeked = r;
        });
        ctx.drawImage(video, 0, 0);
        const blob = await new Promise<Blob>((r) =>
          canvas.toBlob((b) => r(b!), 'image/png')
        );
        downloadBlob(
          blob,
          `frame_${String(Math.round(t * fps) + 1).padStart(4, '0')}.png`
        );
      }
      URL.revokeObjectURL(video.src);
    } catch {
      /* ignore */
    }
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Extract Frames</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <VideoFileUpload accept="video/*" onFile={setFile} />
      {file && (
        <label className="text-xs">
          Frames per second:
          <input
            type="number"
            min={0.1}
            max={30}
            step={0.1}
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
            className="input input-bordered input-xs ml-1 w-16"
          />
        </label>
      )}
      <button
        onClick={handleExtract}
        disabled={!file || processing}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Extracting...' : 'Extract Frames'}
      </button>
    </div>
  );
};
