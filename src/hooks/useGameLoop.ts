import { useEffect, useRef, useCallback } from 'react';

export function useGameLoop(
  callback: (deltaTime: number) => void,
  isRunning: boolean
): void {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Cap delta to prevent spiral of death
    const clampedDelta = Math.min(deltaTime, 33.33); // Max ~30fps equivalent
    callbackRef.current(clampedDelta);

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, loop]);
}
