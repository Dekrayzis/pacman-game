import { TileType } from './types';
import { CLASSIC_MAZE } from './maze';

// ─── Tile shorthand ──────────────────────────────────────────────────

const W = TileType.WALL;
const D = TileType.DOT;
const P = TileType.POWER_PELLET;
const E = TileType.EMPTY;
const H = TileType.GHOST_HOUSE;
const G = TileType.GHOST_DOOR;
const T = TileType.TUNNEL;
const S = TileType.PACMAN_SPAWN;

// All mazes are 28×31, left-right symmetric, with the standard ghost
// house (rows 9-18) preserved so ghost AI works correctly.

// ─── Level 2: "The Grid" — open intersections, grid-like layout ─────

const MAZE_2: number[][] = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 0
  [W,P,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,P,W], // 1
  [W,D,W,W,D,W,W,D,W,W,D,W,W,D,D,W,W,D,W,W,D,W,W,D,W,W,D,W], // 2
  [W,D,W,W,D,W,W,D,W,W,D,W,W,D,D,W,W,D,W,W,D,W,W,D,W,W,D,W], // 3
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 4
  [W,D,W,W,D,W,D,W,W,D,W,W,D,W,W,D,W,W,D,W,W,D,W,D,W,W,D,W], // 5
  [W,D,D,D,D,W,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,W,D,D,D,D,W], // 6
  [W,W,W,W,D,W,W,W,D,D,W,W,D,W,W,D,W,W,D,D,W,W,W,D,W,W,W,W], // 7
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W], // 8
  [W,W,W,W,W,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,W,W,W,W,W], // 9
  [E,E,E,E,E,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,E,E,E,E,E], // 10
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E], // 11
  [E,E,E,E,E,W,D,W,W,E,W,W,W,G,G,W,W,W,E,W,W,D,W,E,E,E,E,E], // 12
  [W,W,W,W,W,W,D,W,W,E,W,H,H,H,H,H,H,W,E,W,W,D,W,W,W,W,W,W], // 13
  [T,E,E,E,E,E,D,E,E,E,W,H,H,H,H,H,H,W,E,E,E,D,E,E,E,E,E,T], // 14
  [W,W,W,W,W,W,D,W,W,E,W,H,H,H,H,H,H,W,E,W,W,D,W,W,W,W,W,W], // 15
  [E,E,E,E,E,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,E,E,E,E,E], // 16
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E], // 17
  [W,W,W,W,W,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,W,W,W,W,W], // 18
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 19
  [W,D,W,W,D,W,W,W,D,W,W,W,D,W,W,D,W,W,W,D,W,W,W,D,W,W,D,W], // 20
  [W,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,W], // 21
  [W,P,D,D,D,W,D,W,W,D,W,W,D,E,S,D,W,W,D,W,W,D,W,D,D,D,P,W], // 22
  [W,W,W,D,D,W,D,W,W,D,D,D,D,W,W,D,D,D,D,W,W,D,W,D,D,W,W,W], // 23
  [W,W,W,D,D,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,D,D,W,W,W], // 24
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W], // 25
  [W,D,W,W,W,W,W,W,D,W,W,W,D,D,D,D,W,W,W,D,W,W,W,W,W,W,D,W], // 26
  [W,D,W,W,W,W,W,W,D,W,W,W,D,W,W,D,W,W,W,D,W,W,W,W,W,W,D,W], // 27
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 28
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 29
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E], // 30
];

// ─── Level 3: "The Chambers" — large rooms connected by corridors ───

const MAZE_3: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 0
  [W,P,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,P,W], // 1
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W], // 2
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 3
  [W,D,W,W,D,W,D,W,W,D,D,D,D,D,D,D,D,D,D,W,W,D,W,D,W,W,D,W], // 4
  [W,D,W,W,D,W,D,D,D,D,W,W,D,W,W,D,W,W,D,D,D,D,W,D,W,W,D,W], // 5
  [W,D,D,D,D,W,D,W,W,D,W,W,D,W,W,D,W,W,D,W,W,D,W,D,D,D,D,W], // 6
  [W,W,W,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,W,W,W], // 7
  [W,D,D,D,W,W,D,D,D,D,W,W,D,W,W,D,W,W,D,D,D,D,W,W,D,D,D,W], // 8
  [W,W,W,W,W,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,W,W,W,W,W], // 9
  [E,E,E,E,E,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,E,E,E,E,E], // 10
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E], // 11
  [E,E,E,E,E,W,D,W,W,E,W,W,W,G,G,W,W,W,E,W,W,D,W,E,E,E,E,E], // 12
  [W,W,W,W,W,W,D,W,W,E,W,H,H,H,H,H,H,W,E,W,W,D,W,W,W,W,W,W], // 13
  [T,E,E,E,E,E,D,E,E,E,W,H,H,H,H,H,H,W,E,E,E,D,E,E,E,E,E,T], // 14
  [W,W,W,W,W,W,D,W,W,E,W,H,H,H,H,H,H,W,E,W,W,D,W,W,W,W,W,W], // 15
  [E,E,E,E,E,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,E,E,E,E,E], // 16
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E], // 17
  [W,W,W,W,W,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,W,W,W,W,W], // 18
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W], // 19
  [W,D,W,W,D,W,W,D,W,W,D,W,D,W,W,D,W,D,W,W,D,W,W,D,W,W,D,W], // 20
  [W,D,D,D,D,D,D,D,D,D,D,W,D,D,D,D,W,D,D,D,D,D,D,D,D,D,D,W], // 21
  [W,P,W,D,W,W,D,W,W,W,D,W,D,E,S,D,W,D,W,W,W,D,W,W,D,W,P,W], // 22
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 23
  [W,D,W,D,W,W,W,W,D,W,W,W,D,W,W,D,W,W,W,D,W,W,W,W,D,W,D,W], // 24
  [W,D,W,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,W,D,W], // 25
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W], // 26
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 27
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 28
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 29
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E], // 30
];

// ─── Level 4: "The Gauntlet" — narrow winding corridors ─────────────

const MAZE_4: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 0
  [W,D,D,D,D,D,D,W,D,D,D,D,D,D,D,D,D,D,D,D,W,D,D,D,D,D,D,W], // 1
  [W,D,W,W,W,W,D,W,D,W,W,W,W,D,D,W,W,W,W,D,W,D,W,W,W,W,D,W], // 2
  [W,P,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,P,W], // 3
  [W,D,W,D,W,W,W,W,D,W,W,W,D,W,W,D,W,W,W,D,W,W,W,W,D,W,D,W], // 4
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 5
  [W,D,W,W,D,W,W,D,W,W,D,W,W,W,W,W,W,D,W,W,D,W,W,D,W,W,D,W], // 6
  [W,D,D,D,D,W,W,D,W,W,D,D,D,D,D,D,D,D,W,W,D,W,W,D,D,D,D,W], // 7
  [W,W,W,W,D,D,D,D,D,D,D,W,D,W,W,D,W,D,D,D,D,D,D,D,W,W,W,W], // 8
  [W,W,W,W,W,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,W,W,W,W,W], // 9
  [E,E,E,E,E,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,E,E,E,E,E], // 10
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E], // 11
  [E,E,E,E,E,W,D,W,W,E,W,W,W,G,G,W,W,W,E,W,W,D,W,E,E,E,E,E], // 12
  [W,W,W,W,W,W,D,W,W,E,W,H,H,H,H,H,H,W,E,W,W,D,W,W,W,W,W,W], // 13
  [T,E,E,E,E,E,D,E,E,E,W,H,H,H,H,H,H,W,E,E,E,D,E,E,E,E,E,T], // 14
  [W,W,W,W,W,W,D,W,W,E,W,H,H,H,H,H,H,W,E,W,W,D,W,W,W,W,W,W], // 15
  [E,E,E,E,E,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,E,E,E,E,E], // 16
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E], // 17
  [W,W,W,W,W,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,W,W,W,W,W], // 18
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W], // 19
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W], // 20
  [W,D,D,D,D,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,D,D,D,D,W], // 21
  [W,W,W,D,D,W,D,W,W,D,W,W,D,E,S,D,W,W,D,W,W,D,W,D,D,W,W,W], // 22
  [W,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,W], // 23
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W], // 24
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 25
  [W,D,W,W,D,W,W,W,D,W,D,W,W,W,W,W,W,D,W,D,W,W,W,D,W,W,D,W], // 26
  [W,P,D,D,D,D,D,D,D,W,D,D,D,D,D,D,D,D,W,D,D,D,D,D,D,D,P,W], // 27
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 28
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 29
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E], // 30
];

// ─── Level 5: "The Fortress" — dense walls, tight passages ──────────

const MAZE_5: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 0
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W], // 1
  [W,D,W,W,W,D,W,W,D,W,W,W,D,W,W,D,W,W,W,D,W,W,D,W,W,W,D,W], // 2
  [W,P,W,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,W,P,W], // 3
  [W,D,D,D,W,D,D,D,D,W,W,D,W,W,W,W,D,W,W,D,D,D,D,W,D,D,D,W], // 4
  [W,W,W,D,W,D,W,W,D,W,W,D,D,D,D,D,D,W,W,D,W,W,D,W,D,W,W,W], // 5
  [W,D,D,D,D,D,W,W,D,D,D,D,W,W,W,W,D,D,D,D,W,W,D,D,D,D,D,W], // 6
  [W,D,W,W,W,D,D,D,D,W,W,D,D,D,D,D,D,W,W,D,D,D,D,W,W,W,D,W], // 7
  [W,D,D,D,D,D,W,W,D,W,W,D,D,W,W,D,D,W,W,D,W,W,D,D,D,D,D,W], // 8
  [W,W,W,W,W,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,W,W,W,W,W], // 9
  [E,E,E,E,E,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,E,E,E,E,E], // 10
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E], // 11
  [E,E,E,E,E,W,D,W,W,E,W,W,W,G,G,W,W,W,E,W,W,D,W,E,E,E,E,E], // 12
  [W,W,W,W,W,W,D,W,W,E,W,H,H,H,H,H,H,W,E,W,W,D,W,W,W,W,W,W], // 13
  [T,E,E,E,E,E,D,E,E,E,W,H,H,H,H,H,H,W,E,E,E,D,E,E,E,E,E,T], // 14
  [W,W,W,W,W,W,D,W,W,E,W,H,H,H,H,H,H,W,E,W,W,D,W,W,W,W,W,W], // 15
  [E,E,E,E,E,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,E,E,E,E,E], // 16
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E], // 17
  [W,W,W,W,W,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,W,W,W,W,W], // 18
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W], // 19
  [W,D,W,W,W,W,D,W,D,W,W,W,D,W,W,D,W,W,W,D,W,D,W,W,W,W,D,W], // 20
  [W,P,D,D,D,D,D,W,D,D,D,D,D,D,D,D,D,D,D,D,W,D,D,D,D,D,P,W], // 21
  [W,D,W,D,W,W,D,W,W,D,W,W,D,E,S,D,W,W,D,W,W,D,W,W,D,W,D,W], // 22
  [W,D,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,D,W], // 23
  [W,D,W,W,W,W,D,W,W,D,W,W,D,W,W,D,W,W,D,W,W,D,W,W,W,W,D,W], // 24
  [W,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,W], // 25
  [W,D,W,W,D,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,D,W,W,D,W], // 26
  [W,D,D,D,D,W,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,W,D,D,D,D,W], // 27
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // 28
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 29
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E], // 30
];

// ─── Level configuration ─────────────────────────────────────────────

export interface LevelConfig {
  maze: number[][];
  name: string;
  wallColor: string;
  ghostSpeedMultiplier: number;
  pacmanSpeedMultiplier: number;
  frightenedDuration: number; // frames at 60fps
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    maze: CLASSIC_MAZE,
    name: 'Classic',
    wallColor: '#2121DE',
    ghostSpeedMultiplier: 1.0,
    pacmanSpeedMultiplier: 1.0,
    frightenedDuration: 480,    // 8s
  },
  {
    maze: MAZE_2,
    name: 'The Grid',
    wallColor: '#00CC66',
    ghostSpeedMultiplier: 1.1,
    pacmanSpeedMultiplier: 1.05,
    frightenedDuration: 420,    // 7s
  },
  {
    maze: MAZE_3,
    name: 'The Chambers',
    wallColor: '#CC00CC',
    ghostSpeedMultiplier: 1.2,
    pacmanSpeedMultiplier: 1.05,
    frightenedDuration: 360,    // 6s
  },
  {
    maze: MAZE_4,
    name: 'The Gauntlet',
    wallColor: '#FF6600',
    ghostSpeedMultiplier: 1.3,
    pacmanSpeedMultiplier: 1.1,
    frightenedDuration: 300,    // 5s
  },
  {
    maze: MAZE_5,
    name: 'The Fortress',
    wallColor: '#DE2121',
    ghostSpeedMultiplier: 1.4,
    pacmanSpeedMultiplier: 1.1,
    frightenedDuration: 240,    // 4s
  },
];

export function getLevelConfig(level: number): LevelConfig {
  const index = (level - 1) % LEVEL_CONFIGS.length;
  return LEVEL_CONFIGS[index];
}

export function getTotalCampaignLevels(): number {
  return LEVEL_CONFIGS.length;
}
