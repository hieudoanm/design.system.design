'use client';

import { type FC, useState, useRef, useCallback, useEffect } from 'react';
import { FaStop, FaTimes, FaPaperPlane } from 'react-icons/fa';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      onCancel();
    }
  }, [onCancel]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    void startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stop();
    };
  }, [startRecording]);

  const formatDuration = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSend = (): void => {
    if (!audioUrl) return;
    void fetch(audioUrl)
      .then((r) => r.blob())
      .then((blob) => onSend(blob, duration));
  };

  return (
    <div className="border-base-300 bg-base-200/60 flex items-center gap-3 border-t px-4 py-3">
      {isRecording && (
        <span className="text-error flex items-center gap-1.5 text-sm">
          <span className="bg-error h-2 w-2 animate-pulse rounded-full" />
          {formatDuration(duration)}
        </span>
      )}
      {audioUrl && !isRecording && (
        <audio src={audioUrl} controls className="h-8 flex-1" />
      )}
      <div className="flex gap-1">
        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            aria-label="Stop recording"
            className="btn btn-circle btn-sm btn-error">
            <FaStop aria-hidden="true" />
          </button>
        ) : audioUrl ? (
          <>
            <button
              type="button"
              onClick={() => {
                setAudioUrl(null);
                setDuration(0);
                void startRecording();
              }}
              aria-label="Re-record"
              className="btn btn-circle btn-sm btn-ghost">
              <FaTimes aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              aria-label="Send voice message"
              className="btn btn-circle btn-sm btn-primary">
              <FaPaperPlane aria-hidden="true" />
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            mediaRecorderRef.current?.stop();
            onCancel();
          }}
          aria-label="Cancel"
          className="btn btn-circle btn-sm btn-ghost">
          <FaTimes aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
