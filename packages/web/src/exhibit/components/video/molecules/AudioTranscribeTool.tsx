'use client';

import { FC, useCallback, useRef, useState } from 'react';
import { VideoToolConfig } from '@/exhibit/data/video/video-tools';
import { downloadBlob } from '@/exhibit/lib/video/video-tools';

export const AudioTranscribeTool: FC<{ config: VideoToolConfig }> = ({
  config,
}) => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const ref = useRef<SpeechRecognition | null>(null);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setTranscript('Speech recognition not supported.');
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e: SpeechRecognitionEvent) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++)
        final += e.results[i][0].transcript;
      setTranscript(final);
    };
    r.onerror = () => setRecording(false);
    r.start();
    ref.current = r;
    setRecording(true);
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    setRecording(false);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium">Transcribe Audio</h2>
      <p className="text-base-content/50 text-sm">{config.description}</p>
      <div className="flex gap-2">
        {!recording ? (
          <button onClick={start} className="btn btn-primary btn-sm">
            Start Recording
          </button>
        ) : (
          <button onClick={stop} className="btn btn-error btn-sm">
            Stop Recording
          </button>
        )}
        {transcript && (
          <button
            onClick={() =>
              downloadBlob(
                new Blob([transcript], { type: 'text/plain' }),
                'transcript.txt'
              )
            }
            className="btn btn-ghost btn-sm">
            Download
          </button>
        )}
      </div>
      <textarea
        className="textarea textarea-bordered h-40 w-full font-mono text-xs"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Transcription will appear here..."
      />
    </div>
  );
};
