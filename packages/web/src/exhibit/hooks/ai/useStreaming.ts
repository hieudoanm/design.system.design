'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseStreamingOptions {
  speed?: number;
  sentencePause?: number;
}

interface UseStreamingReturn {
  text: string;
  isStreaming: boolean;
  start: (fullText: string) => void;
  stop: () => void;
  reset: () => void;
}

export const useStreaming = (
  options: UseStreamingOptions = {}
): UseStreamingReturn => {
  const { speed = 30, sentencePause = 200 } = options;
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const indexRef = useRef(0);
  const fullTextRef = useRef('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stream = useCallback(() => {
    if (indexRef.current >= fullTextRef.current.length) {
      setIsStreaming(false);
      return;
    }

    indexRef.current += 1;
    setText(fullTextRef.current.slice(0, indexRef.current));

    const isSentenceEnd = ['. ', '! ', '? '].includes(
      fullTextRef.current.slice(indexRef.current - 2, indexRef.current)
    );

    timerRef.current = setTimeout(
      stream,
      isSentenceEnd ? sentencePause : speed
    );
  }, [speed, sentencePause]);

  const start = useCallback(
    (fullText: string) => {
      clearTimer();
      fullTextRef.current = fullText;
      indexRef.current = 0;
      setText('');
      setIsStreaming(true);
      timerRef.current = setTimeout(stream, speed);
    },
    [stream, speed]
  );

  const stop = useCallback(() => {
    clearTimer();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    fullTextRef.current = '';
    indexRef.current = 0;
    setText('');
    setIsStreaming(false);
  }, []);

  useEffect(() => () => clearTimer(), []);

  return { text, isStreaming, start, stop, reset };
};
