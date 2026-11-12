export const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const processVideo = (
  file: File,
  opts: {
    canvas?: { width: number; height: number };
    startTime?: number;
    endTime?: number;
    playbackRate?: number;
    mimeType?: string;
    outputName: string;
    onFrame?: (video: HTMLVideoElement, ctx: CanvasRenderingContext2D) => void;
  }
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = async () => {
      const width = opts.canvas?.width ?? video.videoWidth;
      const height = opts.canvas?.height ?? video.videoHeight;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(
        opts.mimeType === 'image/gif' ? 10 : 30
      );
      const mime = opts.mimeType ?? 'video/webm;codecs=vp8,opus';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        downloadBlob(new Blob(chunks, { type: mime }), opts.outputName);
        URL.revokeObjectURL(video.src);
        resolve();
      };
      rec.onerror = reject;
      rec.start();

      if (opts.startTime != null) video.currentTime = opts.startTime;
      if (opts.playbackRate != null) video.playbackRate = opts.playbackRate;

      video.play();

      const tick = () => {
        const ended =
          opts.endTime != null
            ? video.currentTime >= opts.endTime
            : video.paused || video.ended;
        if (ended) {
          rec.stop();
          video.pause();
          return;
        }
        if (opts.onFrame) {
          opts.onFrame(video, ctx);
        } else {
          ctx.drawImage(video, 0, 0, width, height);
        }
        requestAnimationFrame(tick);
      };
      video.ontimeupdate = tick;
    };
    video.onerror = reject;
  });
};
