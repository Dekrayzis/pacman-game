// ─── Direction & Position ────────────────────────────────────────────

export const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
} as const;
export type Direction = typeof Direction[keyof typeof Direction];

export interface Position {
  x: number;
  y: number;
}

export interface TilePosition {
  col: number;
  row: number;
}

// ─── Tile Types ──────────────────────────────────────────────────────

export const TileType = {
  EMPTY: 0,
  WALL: 1,
  DOT: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
  GHOST_DOOR: 5,
  TUNNEL: 6,
  PACMAN_SPAWN: 7,
} as const;
export type TileType = typeof TileType[keyof typeof TileType];

// ─── Ghost ───────────────────────────────────────────────────────────

export const GhostMode = {
  SCATTER: 'SCATTER',
  CHASE: 'CHASE',
  FRIGHTENED: 'FRIGHTENED',
  EATEN: 'EATEN',
} as const;
export type GhostMode = typeof GhostMode[keyof typeof GhostMode];

export const GhostName = {
  BLINKY: 'BLINKY',
  PINKY: 'PINKY',
  INKY: 'INKY',
  CLYDE: 'CLYDE',
} as const;
export type GhostName = typeof GhostName[keyof typeof GhostName];

export interface GhostState {
  name: GhostName;
  position: Position;
  tilePos: TilePosition;
  direction: Direction;
  nextDirection: Direction;
  mode: GhostMode;
  previousMode: GhostMode;
  isInHouse: boolean;
  dotCounter: number;
  speed: number;
  color: string;
  scatterTarget: TilePosition;
}

// ─── Pacman ──────────────────────────────────────────────────────────

export interface PacmanState {
  position: Position;
  tilePos: TilePosition;
  direction: Direction;
  nextDirection: Direction;
  mouthAngle: number;
  mouthOpening: boolean;
  speed: number;
  alive: boolean;
  deathAnimProgress: number;
}

// ─── Game State ──────────────────────────────────────────────────────

export const GamePhase = {
  START: 'START',
  PLAYING: 'PLAYING',
  DYING: 'DYING',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  READY: 'READY',
  EDITOR: 'EDITOR',
} as const;
export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

export interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  lives: number;
  level: number;
  dotsRemaining: number;
  totalDots: number;
  ghostsEatenCombo: number;
  frightenedTimeLeft: number;
  readyTimer: number;
  maze: number[][];
  pacman: PacmanState;
  ghosts: GhostState[];
  fruitActive: boolean;
  fruitTimer: number;
  fruitType: number;
  fruitPosition: TilePosition;
  modeTimer: number;
  modeIndex: number;
  globalMode: GhostMode;
}

// ─── Level Editor ────────────────────────────────────────────────────

export interface CustomLevel {
  id: string;
  name: string;
  maze: number[][];
  createdAt: number;
}
