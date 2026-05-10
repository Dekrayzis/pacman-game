import {
  TileType,
  GhostMode,
} from './types';
import type { GameState, GhostState } from './types';
import {
  SCORE_DOT,
  SCORE_POWER_PELLET,
  SCORE_GHOST_BASE,
  SCORE_FRUIT,
  EXTRA_LIFE_SCORE,
  FRIGHTENED_DURATION,
  DISPLAY_TILE,
  FRUIT_SPAWN,
} from './constants';
import { setGhostMode } from './ghost';

// ─── Tile collection handlers (object literal replaces if/else) ──────

interface CollisionContext {
  state: GameState;
  playSound: (sound: string) => void;
  row: number;
  col: number;
  frightenedDuration: number;
}

const TILE_COLLECTORS: Partial<Record<TileType, (ctx: CollisionContext) => void>> = {
  [TileType.DOT]: ({ state, playSound, row, col }) => {
    state.maze[row][col] = TileType.EMPTY;
    addScore(state, SCORE_DOT);
    state.dotsRemaining--;
    state.ghosts.forEach(g => { g.dotCounter++; });
    playSound('chomp');
  },

  [TileType.POWER_PELLET]: ({ state, playSound, row, col, frightenedDuration }) => {
    state.maze[row][col] = TileType.EMPTY;
    addScore(state, SCORE_POWER_PELLET);
    state.dotsRemaining--;
    state.ghostsEatenCombo = 0;
    state.frightenedTimeLeft = frightenedDuration;
    state.ghosts.forEach(g => setGhostMode(g, GhostMode.FRIGHTENED));
    playSound('power');
  },
};

// ─── Ghost collision handlers (object literal replaces if/else) ──────

const GHOST_COLLISION_HANDLERS: Partial<Record<GhostMode, (state: GameState, ghost: GhostState, playSound: (s: string) => void) => void>> = {
  [GhostMode.FRIGHTENED]: (state, ghost, playSound) => {
    ghost.mode = GhostMode.EATEN;
    state.ghostsEatenCombo++;
    const ghostScore = SCORE_GHOST_BASE * Math.pow(2, state.ghostsEatenCombo - 1);
    addScore(state, ghostScore);
    playSound('ghost_eat');
  },

  [GhostMode.SCATTER]: (_state, _ghost, playSound) => {
    _state.pacman.alive = false;
    _state.pacman.deathAnimProgress = 0;
    playSound('death');
  },

  [GhostMode.CHASE]: (_state, _ghost, playSound) => {
    _state.pacman.alive = false;
    _state.pacman.deathAnimProgress = 0;
    playSound('death');
  },
};

// ─── Collision detection ─────────────────────────────────────────────

export function checkCollisions(state: GameState, playSound: (sound: string) => void, frightenedDuration: number = FRIGHTENED_DURATION): void {
  const { pacman, maze, ghosts } = state;

  if (!pacman.alive) return;

  const col = pacman.tilePos.col;
  const row = pacman.tilePos.row;

  // ─── Tile collection ───────────────────────────────────────────
  if (row >= 0 && row < maze.length && col >= 0 && col < maze[0].length) {
    const tile = maze[row][col] as TileType;
    TILE_COLLECTORS[tile]?.({ state, playSound, row, col, frightenedDuration });
  }

  // ─── Fruit collection ──────────────────────────────────────────
  if (state.fruitActive && col === FRUIT_SPAWN.col && row === FRUIT_SPAWN.row) {
    state.fruitActive = false;
    addScore(state, SCORE_FRUIT[state.fruitType % SCORE_FRUIT.length]);
    playSound('fruit');
  }

  // ─── Ghost collision ───────────────────────────────────────────
  const collisionThreshold = DISPLAY_TILE * 0.7;

  for (const ghost of ghosts) {
    if (ghost.isInHouse || ghost.mode === GhostMode.EATEN) continue;

    const dx = pacman.position.x - ghost.position.x;
    const dy = pacman.position.y - ghost.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < collisionThreshold) {
      GHOST_COLLISION_HANDLERS[ghost.mode]?.(state, ghost, playSound);
      if (!pacman.alive) break; // Stop checking once Pacman dies
    }
  }
}

// ─── Scoring ─────────────────────────────────────────────────────────

function addScore(state: GameState, points: number): void {
  const prevScore = state.score;
  state.score += points;

  // Extra life at threshold
  if (prevScore < EXTRA_LIFE_SCORE && state.score >= EXTRA_LIFE_SCORE) {
    state.lives++;
  }

  // Update high score
  if (state.score > state.highScore) {
    state.highScore = state.score;
  }
}
