import { GhostName, GhostMode } from './types';

// ─── Grid ────────────────────────────────────────────────────────────

export const TILE_SIZE = 16;
export const SCALE = 2;
export const DISPLAY_TILE = TILE_SIZE * SCALE;
export const MAZE_WIDTH = 28;
export const MAZE_HEIGHT = 31;
export const CANVAS_WIDTH = MAZE_WIDTH * DISPLAY_TILE;
export const CANVAS_HEIGHT = MAZE_HEIGHT * DISPLAY_TILE;

// ─── Speed (display pixels per 60 Hz step) ─────────────────────────
// Matched to the arcade's level 1 in tiles per second. The arcade moves
// Pac-Man at 80% of 75.76 px/s on 8 px tiles, about 7.6 tiles a second;
// tiles here are 32 display pixels, so that's about 4 per step. Ghosts run
// at 75% (3.6), frightened ghosts at 50% (2), and eyes heading home fast.

export const BASE_PACMAN_SPEED = 4;
export const BASE_GHOST_SPEED = 3.6;
export const FRIGHTENED_GHOST_SPEED = 2;
export const EATEN_GHOST_SPEED = 8;
export const TUNNEL_SPEED = 2;

// ─── Timing (in frames at 60fps) ────────────────────────────────────

export const FRIGHTENED_DURATION = 480; // 8 seconds
export const READY_DURATION = 120; // 2 seconds
export const DEATH_ANIMATION_DURATION = 90; // 1.5 seconds
export const LEVEL_COMPLETE_DURATION = 120;

// ─── Scatter / Chase mode durations per wave (frames) ──────────────

export const MODE_SCHEDULE: { mode: GhostMode; duration: number }[] = [
  { mode: GhostMode.SCATTER, duration: 420 },   // 7s scatter
  { mode: GhostMode.CHASE, duration: 1200 },    // 20s chase
  { mode: GhostMode.SCATTER, duration: 420 },   // 7s scatter
  { mode: GhostMode.CHASE, duration: 1200 },    // 20s chase
  { mode: GhostMode.SCATTER, duration: 300 },   // 5s scatter
  { mode: GhostMode.CHASE, duration: 1200 },    // 20s chase
  { mode: GhostMode.SCATTER, duration: 300 },   // 5s scatter
  { mode: GhostMode.CHASE, duration: Infinity }, // permanent chase
];

// ─── Scoring ─────────────────────────────────────────────────────────

export const SCORE_DOT = 10;
export const SCORE_POWER_PELLET = 50;
export const SCORE_GHOST_BASE = 200; // doubles: 200, 400, 800, 1600
export const SCORE_FRUIT = [100, 300, 500, 700, 1000, 2000, 3000, 5000];
export const EXTRA_LIFE_SCORE = 10000;

// ─── Pacman ──────────────────────────────────────────────────────────

export const INITIAL_LIVES = 3;
export const PACMAN_SPAWN_COL = 14;
export const PACMAN_SPAWN_ROW = 23;
export const MOUTH_SPEED = 0.12;

// ─── Ghost spawn / house ─────────────────────────────────────────────

export const GHOST_HOUSE_CENTER = { col: 14, row: 14 };
export const GHOST_DOOR = { col: 14, row: 12 };

export const GHOST_SPAWN: Record<GhostName, { col: number; row: number }> = {
  [GhostName.BLINKY]: { col: 14, row: 11 },
  [GhostName.PINKY]: { col: 14, row: 14 },
  [GhostName.INKY]: { col: 12, row: 14 },
  [GhostName.CLYDE]: { col: 16, row: 14 },
};

export const GHOST_SCATTER_TARGETS: Record<GhostName, { col: number; row: number }> = {
  [GhostName.BLINKY]: { col: 25, row: 0 },
  [GhostName.PINKY]: { col: 2, row: 0 },
  [GhostName.INKY]: { col: 27, row: 30 },
  [GhostName.CLYDE]: { col: 0, row: 30 },
};

export const GHOST_COLORS: Record<GhostName, string> = {
  [GhostName.BLINKY]: '#FF0000',
  [GhostName.PINKY]: '#FFB8FF',
  [GhostName.INKY]: '#00FFFF',
  [GhostName.CLYDE]: '#FFB852',
};

export const GHOST_DOT_LIMITS: Record<GhostName, number> = {
  [GhostName.BLINKY]: 0,
  [GhostName.PINKY]: 0,
  [GhostName.INKY]: 30,
  [GhostName.CLYDE]: 60,
};

// ─── Fruit ───────────────────────────────────────────────────────────

export const FRUIT_SPAWN = { col: 14, row: 17 };
export const FRUIT_APPEAR_DOTS = [70, 170];
export const FRUIT_DURATION = 600; // 10 seconds
export const FRUIT_SYMBOLS = ['🍒', '🍓', '🍊', '🍎', '🍈', '🚀', '🔔', '🍦'];

// ─── Editor / Display Colors ─────────────────────────────────────────

export const TILE_COLORS: Record<number, string> = {
  0: '#333333',   // EMPTY
  1: '#2121DE',   // WALL (default, overridden by wallColor)
  2: '#FCB5A2',   // DOT
  3: '#FCB5A2',   // POWER_PELLET
  4: '#FFB8FF',   // GHOST_HOUSE
  5: '#FFB8FF',   // GHOST_DOOR
  7: '#FFFF00',   // PACMAN_SPAWN
};

export const WALL_PRESETS: { color: string; label: string }[] = [
  { color: '#2121DE', label: 'Classic Blue' },
  { color: '#DE2121', label: 'Red' },
  { color: '#00CC66', label: 'Green' },
  { color: '#CC00CC', label: 'Purple' },
  { color: '#FF6600', label: 'Orange' },
  { color: '#00CCCC', label: 'Cyan' },
  { color: '#CCCC00', label: 'Yellow' },
  { color: '#FF3399', label: 'Pink' },
  { color: '#6644FF', label: 'Indigo' },
  { color: '#FFFFFF', label: 'White' },
];
