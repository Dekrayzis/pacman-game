import { GamePhase } from './types';
import type { GameState } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DISPLAY_TILE,
  FRUIT_SYMBOLS,
} from './constants';
import { renderMaze, renderFruit } from './mazeRenderer';
import { renderPacman } from './pacman';
import { renderGhost } from './ghostRenderer';

// ─── Render a single game frame (extracted from GameCanvas) ──────────

export function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  frame: number,
  wallColor: string,
): void {
  // Clear
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Flash maze on level complete
  const levelFlash = state.phase === GamePhase.LEVEL_COMPLETE && Math.floor(frame / 15) % 2 === 0;
  if (levelFlash) {
    ctx.globalAlpha = 0.5;
  }

  // Render maze
  const pelletVisible = Math.floor(frame / 15) % 2 === 0;
  renderMaze(ctx, state.maze, pelletVisible, wallColor);

  if (levelFlash) {
    ctx.globalAlpha = 1;
  }

  // Render fruit
  if (state.fruitActive) {
    renderFruit(ctx, state.fruitPosition.col, state.fruitPosition.row, state.fruitType, FRUIT_SYMBOLS);
  }

  // Render ghosts and Pacman (not during level complete)
  if (state.phase !== GamePhase.LEVEL_COMPLETE) {
    const flashWhite = state.frightenedTimeLeft > 0
      && state.frightenedTimeLeft < 120
      && Math.floor(frame / 8) % 2 === 0;

    state.ghosts.forEach(ghost => {
      renderGhost(ctx, ghost, flashWhite);
    });

    renderPacman(ctx, state.pacman);
  }

  // "READY!" text
  if (state.phase === GamePhase.READY) {
    ctx.fillStyle = '#FFFF00';
    ctx.font = `${DISPLAY_TILE * 0.7}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('READY!', CANVAS_WIDTH / 2, 17.5 * DISPLAY_TILE);
  }
}
