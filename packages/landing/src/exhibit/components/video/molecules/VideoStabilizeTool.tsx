'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoStabilizeTool: FC<{ config: VideoToolConfig }> = ({
  config,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleStabilize = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      await new Promise((r) => {
        video.onloadedmetadata = r;
      });
      video.play();
      const ox = video.videoWidth * 0.1,
        oy = video.videoHeight * 0.1;
      const cw = video.videoWidth - ox * 2,
        ch = video.videoHeight - oy * 2;
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(30);
      const rec = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        const a = document.createElement('a');
        const url = URL.createObjectURL(
          new Blob(chunks, { type: 'video/webm' })
        );
        a.href = url;
        a.download = file.name.replace(/\.[^.]+$/, '-stabilized.webm');
        a.click();
        URL.revokeObjectURL(url);
        setProcessing(false);
      };
      rec.start();
      const tick = () => {
        if (video.paused || video.ended) {
          rec.stop();
          video.pause();
          URL.revokeObjectURL(video.src);
          return;
        }
        ctx.drawImage(video, ox, oy, cw, ch, 0, 0, cw, ch);
        requestAnimationFrame(tick);
      };
      video.ontimeupdate = tick;
    } catch {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Stabilize Video</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <p className="text-base-content/40 text-xs">
        Note: browser-based stabilization crops 10% border as simple crop-based
        stabilization.
      </p>
      <VideoFileUpload accept="video/*" onFile={setFile} />
      {file && <p className="text-base-content/60 text-xs">{file.name}</p>}
      <button
        onClick={handleStabilize}
        disabled={!file || processing}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Stabilizing...' : 'Stabilize'}
      </button>
    </div>
  );
};
