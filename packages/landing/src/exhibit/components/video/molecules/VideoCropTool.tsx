'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { processVideo } from '@/exhibit/lib/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoCropTool: FC<{ config: VideoToolConfig }> = ({ config }) => {
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 640, h: 480 });
  const [vw, setVw] = useState(640);
  const [vh, setVh] = useState(480);
  const [processing, setProcessing] = useState(false);

  const handleLoad = (f: File) => {
    setFile(f);
    const v = document.createElement('video');
    v.src = URL.createObjectURL(f);
    v.onloadedmetadata = () => {
      setVw(v.videoWidth);
      setVh(v.videoHeight);
      setCrop({ x: 0, y: 0, w: v.videoWidth, h: v.videoHeight });
      URL.revokeObjectURL(v.src);
    };
  };

  const handleCrop = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      await processVideo(file, {
        canvas: { width: crop.w, height: crop.h },
        outputName: file.name.replace(/\.[^.]+$/, '-cropped.webm'),
        onFrame: (video, ctx) => {
          ctx.drawImage(
            video,
            crop.x,
            crop.y,
            crop.w,
            crop.h,
            0,
            0,
            crop.w,
            crop.h
          );
        },
      });
    } catch {}
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Crop Video</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <VideoFileUpload accept="video/*" onFile={handleLoad} />
      {file && (
        <div className="grid max-w-xs grid-cols-2 gap-2 text-xs">
          {(['x', 'y', 'w', 'h'] as const).map((k) => (
            <label key={k}>
              {k.toUpperCase()}:
              <input
                type="number"
                min={0}
                max={k === 'w' ? vw : k === 'h' ? vh : Math.max(vw, vh)}
                value={crop[k]}
                onChange={(e) =>
                  setCrop({ ...crop, [k]: Number(e.target.value) })
                }
                className="input input-bordered input-xs ml-1 w-16"
              />
            </label>
          ))}
        </div>
      )}
      <button
        onClick={handleCrop}
        disabled={!file || processing}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Cropping...' : 'Crop'}
      </button>
    </div>
  );
};
