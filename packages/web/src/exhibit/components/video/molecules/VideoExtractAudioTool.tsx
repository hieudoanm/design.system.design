'use client';

import { FC, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { VideoFileUpload } from '@/exhibit/components/video/atoms/VideoFileUpload';

export const VideoExtractAudioTool: FC<{ config: VideoToolConfig }> = ({
  config,
}) => {
  const [file, setFile] = useState<File | null>(null);
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
      const ac = new AudioContext();
      const src = ac.createMediaElementSource(video);
      const dest = ac.createMediaStreamDestination();
      src.connect(dest);
      video.play();
      const rec = new MediaRecorder(dest.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        const a = document.createElement('a');
        const url = URL.createObjectURL(
          new Blob(chunks, { type: 'audio/webm' })
        );
        a.href = url;
        a.download = file.name.replace(/\.[^.]+$/, '-audio.webm');
        a.click();
        URL.revokeObjectURL(url);
        setProcessing(false);
      };
      rec.start();
      video.onended = () => {
        rec.stop();
        video.pause();
        URL.revokeObjectURL(video.src);
      };
    } catch {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Extract Audio</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <VideoFileUpload accept="video/*" onFile={setFile} />
      {file && <p className="text-base-content/60 text-xs">{file.name}</p>}
      <button
        onClick={handleExtract}
        disabled={!file || processing}
        className="btn btn-primary btn-sm w-fit">
        {processing ? 'Extracting...' : 'Extract Audio'}
      </button>
    </div>
  );
};
