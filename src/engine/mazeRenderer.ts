import { TileType } from './types';
import {
  MAZE_WIDTH,
  MAZE_HEIGHT,
  DISPLAY_TILE,
} from './constants';

// ─── Wall adjacency helper ───────────────────────────────────────────

function isWall(maze: number[][], col: number, row: number): boolean {
  if (row < 0 || row >= MAZE_HEIGHT || col < 0 || col >= MAZE_WIDTH) return false;
  return maze[row][col] === TileType.WALL;
}

// ─── Hex → rgba glow helper ─────────────────────────────────────────

function hexToGlow(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Corner arc config (replaces 4 near-identical if-blocks) ─────────

interface CornerArc {
  check: (top: boolean, bottom: boolean, left: boolean, right: boolean) => boolean;
  offsetX: number;
  offsetY: number;
  moveAxis: 'x' | 'y';
  startAngle: number;
  endAngle: number;
}

const CORNER_ARCS: CornerArc[] = [
  { check: (t, b, l, r) => !t && !l && r && b, offsetX: 1, offsetY: 1, moveAxis: 'y', startAngle: Math.PI, endAngle: Math.PI * 1.5 },
  { check: (t, b, l, r) => !t && !r && l && b, offsetX: -1, offsetY: 1, moveAxis: 'y', startAngle: Math.PI * 1.5, endAngle: Math.PI * 2 },
  { check: (t, b, l, r) => !b && !l && r && t, offsetX: 1, offsetY: -1, moveAxis: 'x', startAngle: Math.PI * 0.5, endAngle: Math.PI },
  { check: (t, b, l, r) => !b && !r && l && t, offsetX: -1, offsetY: -1, moveAxis: 'x', startAngle: 0, endAngle: Math.PI * 0.5 },
];

// ─── Wall rendering ─────────────────────────────────────────────────

function renderWall(
  ctx: CanvasRenderingContext2D,
  maze: number[][],
  col: number,
  row: number,
  x: number,
  y: number,
  tileSize: number,
  wallColor: string,
): void {
  ctx.strokeStyle = wallColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = hexToGlow(wallColor, 0.3);
  ctx.shadowBlur = 6;

  const top = isWall(maze, col, row - 1);
  const bottom = isWall(maze, col, row + 1);
  const left = isWall(maze, col - 1, row);
  const right = isWall(maze, col + 1, row);

  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;
  const r = tileSize / 2 - 2;

  ctx.beginPath();

  if (!top && !bottom && !left && !right) {
    // Isolated wall
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
  } else {
    // Lines to connected neighbors
    const neighbors: [boolean, number, number][] = [
      [top, cx, y],
      [bottom, cx, y + tileSize],
      [left, x, cy],
      [right, x + tileSize, cy],
    ];

    for (const [connected, nx, ny] of neighbors) {
      if (connected) {
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
      }
    }

    // Corner arcs
    for (const arc of CORNER_ARCS) {
      if (arc.check(top, bottom, left, right)) {
        const ax = cx + arc.offsetX * r;
        const ay = cy + arc.offsetY * r;
        const mx = arc.moveAxis === 'x' ? ax : cx;
        const my = arc.moveAxis === 'y' ? ay : cy;
        ctx.moveTo(mx, my);
        ctx.arc(ax, ay, r, arc.startAngle, arc.endAngle);
      }
    }
  }

  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ─── Wall layer cache ────────────────────────────────────────────────
// Walls never change during a level, and their glow (shadowBlur) is the
// most expensive thing on screen. So they're drawn once per maze and colour
// onto an off-screen canvas, and each frame copies that in one drawImage.

const wallLayers = new WeakMap<number[][], { color: string; canvas: HTMLCanvasElement }>();

function getWallLayer(maze: number[][], wallColor: string, tileSize: number): HTMLCanvasElement {
  const cached = wallLayers.get(maze);
  if (cached && cached.color === wallColor) return cached.canvas;

  const canvas = document.createElement('canvas');
  canvas.width = (maze[0]?.length ?? 0) * tileSize;
  canvas.height = maze.length * tileSize;
  const ctx = canvas.getContext('2d')!;
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      if (maze[row][col] === TileType.WALL) {
        renderWall(ctx, maze, col, row, col * tileSize, row * tileSize, tileSize, wallColor);
      }
    }
  }
  wallLayers.set(maze, { color: wallColor, canvas });
  return canvas;
}

// ─── Tile renderers (object literal replaces switch) ─────────────────

interface TileRenderParams {
  ctx: CanvasRenderingContext2D;
  maze: number[][];
  col: number;
  row: number;
  x: number;
  y: number;
  tileSize: number;
  wallColor: string;
  powerPelletVisible: boolean;
}

// Walls aren't here: they come from the cached layer (getWallLayer).
const TILE_RENDERERS: Partial<Record<TileType, (p: TileRenderParams) => void>> = {
  [TileType.DOT]: ({ ctx, x, y, tileSize }) => {
    ctx.fillStyle = '#FCB5A2';
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  },

  [TileType.POWER_PELLET]: ({ ctx, x, y, tileSize, powerPelletVisible }) => {
    if (!powerPelletVisible) return;
    ctx.fillStyle = '#FCB5A2';
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, 8, 0, Math.PI * 2);
    ctx.fill();
  },

  [TileType.GHOST_DOOR]: ({ ctx, x, y, tileSize }) => {
    ctx.fillStyle = '#FFB8FF';
    ctx.fillRect(x + 2, y + tileSize / 2 - 2, tileSize - 4, 4);
  },
};

// ─── Maze rendering ──────────────────────────────────────────────────

export function renderMaze(
  ctx: CanvasRenderingContext2D,
  maze: number[][],
  powerPelletVisible: boolean,
  wallColor: string = '#2121DE',
): void {
  const tileSize = DISPLAY_TILE;

  ctx.drawImage(getWallLayer(maze, wallColor, tileSize), 0, 0);

  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      const tile = maze[row][col] as TileType;
      const x = col * tileSize;
      const y = row * tileSize;
      TILE_RENDERERS[tile]?.({ ctx, maze, col, row, x, y, tileSize, wallColor, powerPelletVisible });
    }
  }
}

export function renderFruit(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  fruitType: number,
  symbols: string[],
): void {
  const x = col * DISPLAY_TILE + DISPLAY_TILE / 2;
  const y = row * DISPLAY_TILE + DISPLAY_TILE / 2;
  ctx.font = `${DISPLAY_TILE - 8}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbols[fruitType % symbols.length], x, y);
}
