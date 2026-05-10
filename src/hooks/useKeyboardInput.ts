import { useEffect } from 'react';
import { Direction, GamePhase } from '../engine/types';
import type { GameState } from '../engine/types';

// ─── Key → Direction lookup (replaces switch) ────────────────────────

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: Direction.UP, w: Direction.UP, W: Direction.UP,
  ArrowDown: Direction.DOWN, s: Direction.DOWN, S: Direction.DOWN,
  ArrowLeft: Direction.LEFT, a: Direction.LEFT, A: Direction.LEFT,
  ArrowRight: Direction.RIGHT, d: Direction.RIGHT, D: Direction.RIGHT,
};

// ─── Hook ────────────────────────────────────────────────────────────

export function useKeyboardInput(
  gameStateRef: React.RefObject<GameState | null>,
): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (!state) return;

      const dir = KEY_TO_DIRECTION[e.key];
      if (!dir) return;

      e.preventDefault();

      if (state.phase === GamePhase.READY) {
        state.phase = GamePhase.PLAYING;
        state.readyTimer = 0;
      }

      state.pacman.nextDirection = dir;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStateRef]);
}
