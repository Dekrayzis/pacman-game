import { useEffect, useRef, useCallback } from 'react';

/** The game is tuned in 60ths of a second: speeds per step, timers in steps. */
const STEP_MS = 1000 / 60;
/** A long stall (a hidden tab, a slow frame) catches up this far at most. */
const MAX_CATCH_UP_MS = 250;

/**
 * Runs the game at a fixed 60 steps a second, whatever the screen's frame
 * rate. Each animation frame, `callback` is told how many steps are due: on a
 * 60 Hz screen usually one, on a 144 Hz screen often none, and after a slow
 * frame two or three, so the game keeps its speed instead of slowing down.
 */
export function useGameLoop(
  callback: (steps: number) => void,
  isRunning: boolean
): void {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const pendingRef = useRef<number>(0);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    pendingRef.current += Math.min(timestamp - lastTimeRef.current, MAX_CATCH_UP_MS);
    lastTimeRef.current = timestamp;

    // Round rather than floor: a step is due once at least half of it has
    // built up, and the remainder may go up to half a step negative. Flooring
    // left the remainder sitting right on a step boundary on a 60 Hz screen
    // (the first frame adds nothing, then each frame adds a whole step), so
    // the slightest rAF jitter alternated 0 and 2 steps: a visible hitch.
    // Rounding keeps the remainder centred, half a step clear of either
    // boundary. The remainder stays bounded, so the long-run rate is still
    // exactly 60 steps a second on any screen (120 Hz, 144 Hz...).
    const steps = Math.max(0, Math.round(pendingRef.current / STEP_MS));
    pendingRef.current -= steps * STEP_MS;
    callbackRef.current(steps);

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      pendingRef.current = 0;
      frameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, loop]);
}
