'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoMergeTool: FC<{ config: VideoToolConfig }> = ({ config }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    try {
      const videos = await Promise.all(
        files.map(async (f) => {
          const v = document.createElement('video');
          v.src = URL.createObjectURL(f);
          await new Promise((r) => {
            v.onloadedmetadata = r;
          });
          return v;
        })
      );
      const cw = Math.max(...videos.map((v) => v.videoWidth));
      const ch = Math.max(...videos.map((v) => v.videoHeight));
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
        a.download = 'merged.webm';
        a.click();
        URL.revokeObjectURL(url);
        setProcessing(false);
      };
      rec.start();
      for (const v of videos) {
        v.currentTime = 0;
        v.play();
        await new Promise<void>((resolve) => {
          const tick = () => {
            if (v.paused || v.ended) {
              v.pause();
              resolve();
              return;
            }
            ctx.drawImage(v, 0, 0, cw, ch);
            requestAnimationFrame(tick);
          };
          v.ontimeupdate = tick;
        });
        videos.forEach((vv) => URL.revokeObjectURL(vv.src));
      }
      rec.stop();
    } catch {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Merge Videos</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <VideoFileUpload
        accept="video/*"
        onFile={(f) => setFiles((p) => [...p, f])}
      />
      {files.length > 0 && (
        <ul className="space-y-1 text-xs">
          {files.map((f, i) => (
            <li key={i} className="text-base-content/60">
              {i + 1}. {f.name}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={handleMerge}
        disabled={files.length < 2 || processing}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Merging...' : 'Merge'}
      </button>
    </div>
  );
};
