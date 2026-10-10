import { TileType, Direction } from './types';
import type { TilePosition } from './types';
import {
  MAZE_WIDTH,
  MAZE_HEIGHT,
  DISPLAY_TILE,
} from './constants';

// ─── Classic Pac-Man maze (28×31) ────────────────────────────────────
// 0 = EMPTY, 1 = WALL, 2 = DOT, 3 = POWER_PELLET,
// 4 = GHOST_HOUSE, 5 = GHOST_DOOR, 6 = TUNNEL, 7 = PACMAN_SPAWN

const W = TileType.WALL;
const D = TileType.DOT;
const P = TileType.POWER_PELLET;
const E = TileType.EMPTY;
const H = TileType.GHOST_HOUSE;
const G = TileType.GHOST_DOOR;
const T = TileType.TUNNEL;
const S = TileType.PACMAN_SPAWN;

export const CLASSIC_MAZE: number[][] = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W], // 0
  [W, D, D, D, D, D, D, D, D, D, D, D, D, W, W, D, D, D, D, D, D, D, D, D, D, D, D, W], // 1
  [W, D, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, D, W], // 2
  [W, P, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, P, W], // 3
  [W, D, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, D, W], // 4
  [W, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, W], // 5
  [W, D, W, W, W, W, D, W, W, D, W, W, W, W, W, W, W, W, D, W, W, D, W, W, W, W, D, W], // 6
  [W, D, W, W, W, W, D, W, W, D, W, W, W, W, W, W, W, W, D, W, W, D, W, W, W, W, D, W], // 7
  [W, D, D, D, D, D, D, W, W, D, D, D, D, W, W, D, D, D, D, W, W, D, D, D, D, D, D, W], // 8
  [W, W, W, W, W, W, D, W, W, W, W, W, E, W, W, E, W, W, W, W, W, D, W, W, W, W, W, W], // 9
  [E, E, E, E, E, W, D, W, W, W, W, W, E, W, W, E, W, W, W, W, W, D, W, E, E, E, E, E], // 10
  [E, E, E, E, E, W, D, W, W, E, E, E, E, E, E, E, E, E, E, W, W, D, W, E, E, E, E, E], // 11
  [E, E, E, E, E, W, D, W, W, E, W, W, W, G, G, W, W, W, E, W, W, D, W, E, E, E, E, E], // 12
  [W, W, W, W, W, W, D, W, W, E, W, H, H, H, H, H, H, W, E, W, W, D, W, W, W, W, W, W], // 13
  [T, E, E, E, E, E, D, E, E, E, W, H, H, H, H, H, H, W, E, E, E, D, E, E, E, E, E, T], // 14
  [W, W, W, W, W, W, D, W, W, E, W, H, H, H, H, H, H, W, E, W, W, D, W, W, W, W, W, W], // 15
  [E, E, E, E, E, W, D, W, W, E, W, W, W, W, W, W, W, W, E, W, W, D, W, E, E, E, E, E], // 16
  [E, E, E, E, E, W, D, W, W, E, E, E, E, E, E, E, E, E, E, W, W, D, W, E, E, E, E, E], // 17
  [W, W, W, W, W, W, D, W, W, E, W, W, W, W, W, W, W, W, E, W, W, D, W, W, W, W, W, W], // 18
  [W, D, D, D, D, D, D, D, D, D, D, D, D, W, W, D, D, D, D, D, D, D, D, D, D, D, D, W], // 19
  [W, D, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, D, W], // 20
  [W, D, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, D, W], // 21
  [W, P, D, D, W, W, D, D, D, D, D, D, D, E, S, D, D, D, D, D, D, D, W, W, D, D, P, W], // 22
  [W, W, W, D, W, W, D, W, W, D, W, W, W, W, W, W, W, W, D, W, W, D, W, W, D, W, W, W], // 23
  [W, W, W, D, W, W, D, W, W, D, W, W, W, W, W, W, W, W, D, W, W, D, W, W, D, W, W, W], // 24
  [W, D, D, D, D, D, D, W, W, D, D, D, D, W, W, D, D, D, D, W, W, D, D, D, D, D, D, W], // 25
  [W, D, W, W, W, W, W, W, W, W, W, W, D, W, W, D, W, W, W, W, W, W, W, W, W, W, D, W], // 26
  [W, D, W, W, W, W, W, W, W, W, W, W, D, W, W, D, W, W, W, W, W, W, W, W, W, W, D, W], // 27
  [W, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, W], // 28
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W], // 29
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E], // 30
];

// ─── Maze helpers ────────────────────────────────────────────────────

const DOT_TILES = new Set<number>([TileType.DOT, TileType.POWER_PELLET]);

export function cloneMaze(maze: number[][]): number[][] {
  return maze.map(row => [...row]);
}

export function getTile(maze: number[][], col: number, row: number): TileType {
  if (row < 0 || row >= MAZE_HEIGHT || col < 0 || col >= MAZE_WIDTH) {
    return TileType.EMPTY;
  }
  return maze[row][col] as TileType;
}

export function isWalkable(maze: number[][], col: number, row: number): boolean {
  const tile = getTile(maze, col, row);
  return tile !== TileType.WALL && tile !== TileType.GHOST_HOUSE && tile !== TileType.GHOST_DOOR;
}

export function countDots(maze: number[][]): number {
  return maze.flat().filter(tile => DOT_TILES.has(tile)).length;
}

export function findPacmanSpawn(maze: number[][]): TilePosition {
  for (let row = 0; row < maze.length; row++) {
    const col = maze[row].indexOf(TileType.PACMAN_SPAWN);
    if (col !== -1) return { col, row };
  }
  return { col: 14, row: 22 };
}

// ─── Tile center helpers ─────────────────────────────────────────────

export function tileCenterX(col: number): number {
  return col * DISPLAY_TILE + DISPLAY_TILE / 2;
}

export function tileCenterY(row: number): number {
  return row * DISPLAY_TILE + DISPLAY_TILE / 2;
}

// ─── Direction helpers (object literals replace switch) ──────────────

const DIRECTION_DELTAS: Record<Direction, TilePosition> = {
  [Direction.UP]: { col: 0, row: -1 },
  [Direction.DOWN]: { col: 0, row: 1 },
  [Direction.LEFT]: { col: -1, row: 0 },
  [Direction.RIGHT]: { col: 1, row: 0 },
  [Direction.NONE]: { col: 0, row: 0 },
};

export function getDirectionDelta(dir: Direction): TilePosition {
  return DIRECTION_DELTAS[dir];
}

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
  [Direction.NONE]: Direction.NONE,
};

export function getOppositeDirection(dir: Direction): Direction {
  return OPPOSITE_DIRECTIONS[dir];
}
