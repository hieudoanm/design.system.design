import { useState, useCallback, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

interface UsePullToRefreshReturn {
  isRefreshing: boolean;
  pullDistance: number;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
}: UsePullToRefreshOptions): UsePullToRefreshReturn => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    if (target.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return;
      const target = e.currentTarget as HTMLDivElement;
      if (target.scrollTop > 0) return;

      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        setPullDistance(Math.min(delta * 0.5, threshold * 1.5));
      }
    },
    [isRefreshing, threshold]
  );

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      console.log('[usePullToRefresh] refreshing');
      try {
        await onRefresh();
      } catch (err) {
        console.warn('[usePullToRefresh] refresh failed', err);
      } finally {
        setIsRefreshing(false);
        console.log('[usePullToRefresh] refresh complete');
      }
    }
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    isRefreshing,
    pullDistance,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
};
