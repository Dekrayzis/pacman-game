import { useRef, useEffect, useCallback, useState } from 'react';
import { TileType } from '../../engine/types';
import { MAZE_WIDTH, MAZE_HEIGHT } from '../../engine/constants';
import styles from './EditorCanvas.module.scss';

interface EditorCanvasProps {
  maze: number[][];
  selectedTool: TileType;
  onTilePaint: (col: number, row: number) => void;
  onPaintStart: () => void;
  wallColor?: string;
}

const EDITOR_TILE = 20; // Smaller tiles for editor view
const CANVAS_W = MAZE_WIDTH * EDITOR_TILE;
const CANVAS_H = MAZE_HEIGHT * EDITOR_TILE;

const TILE_COLORS: Record<number, string> = {
  [TileType.EMPTY]: '#0a0a0a',
  [TileType.WALL]: '#2121DE',
  [TileType.DOT]: '#0a0a0a',
  [TileType.POWER_PELLET]: '#0a0a0a',
  [TileType.GHOST_HOUSE]: '#1a0a1a',
  [TileType.GHOST_DOOR]: '#0a0a0a',
  [TileType.TUNNEL]: '#0a1a0a',
  [TileType.PACMAN_SPAWN]: '#0a0a0a',
};

// ─── Tile detail renderers (object literal replaces switch) ──────────

interface EditorTileParams {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  tileSize: number;
  wallColor: string;
}

const EDITOR_TILE_RENDERERS: Partial<Record<TileType, (p: EditorTileParams) => void>> = {
  [TileType.WALL]: ({ ctx, x, y, tileSize, wallColor }) => {
    ctx.fillStyle = wallColor;
    ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
  },

  [TileType.DOT]: ({ ctx, x, y, tileSize }) => {
    ctx.fillStyle = '#FCB5A2';
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  },

  [TileType.POWER_PELLET]: ({ ctx, x, y, tileSize }) => {
    ctx.fillStyle = '#FCB5A2';
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  },

  [TileType.GHOST_HOUSE]: ({ ctx, x, y, tileSize }) => {
    ctx.strokeStyle = '#FFB8FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
  },

  [TileType.GHOST_DOOR]: ({ ctx, x, y, tileSize }) => {
    ctx.fillStyle = '#FFB8FF';
    ctx.fillRect(x + 2, y + tileSize / 2 - 1, tileSize - 4, 3);
  },

  [TileType.TUNNEL]: ({ ctx, x, y, tileSize }) => {
    ctx.fillStyle = '#00FF41';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⇔', x + tileSize / 2, y + tileSize / 2);
  },

  [TileType.PACMAN_SPAWN]: ({ ctx, x, y, tileSize }) => {
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, 6, 0.25 * Math.PI, 1.75 * Math.PI);
    ctx.lineTo(x + tileSize / 2, y + tileSize / 2);
    ctx.fill();
  },
};

// ─── Component ───────────────────────────────────────────────────────

export default function EditorCanvas({ maze, onTilePaint, onPaintStart, wallColor = '#2121DE' }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [hoverTile, setHoverTile] = useState<{ col: number; row: number } | null>(null);

  const getGridPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const col = Math.floor((e.clientX - rect.left) * scaleX / EDITOR_TILE);
    const row = Math.floor((e.clientY - rect.top) * scaleY / EDITOR_TILE);
    if (col < 0 || col >= MAZE_WIDTH || row < 0 || row >= MAZE_HEIGHT) return null;
    return { col, row };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getGridPos(e);
    if (!pos) return;

    onPaintStart();
    setIsPainting(true);
    onTilePaint(pos.col, pos.row);
  }, [getGridPos, onTilePaint, onPaintStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getGridPos(e);
    setHoverTile(pos);

    if (isPainting && pos) {
      onTilePaint(pos.col, pos.row);
    }
  }, [getGridPos, isPainting, onTilePaint]);

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Render the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw tiles
    for (let row = 0; row < maze.length; row++) {
      for (let col = 0; col < (maze[row]?.length || 0); col++) {
        const tile = maze[row][col];
        const x = col * EDITOR_TILE;
        const y = row * EDITOR_TILE;

        // Background
        const bgColor = tile === TileType.WALL ? wallColor : (TILE_COLORS[tile] || '#0a0a0a');
        ctx.fillStyle = bgColor;
        ctx.globalAlpha = tile === TileType.WALL ? 0.3 : 1;
        ctx.fillRect(x, y, EDITOR_TILE, EDITOR_TILE);
        ctx.globalAlpha = 1;

        // Tile details via object lookup
        EDITOR_TILE_RENDERERS[tile as TileType]?.({ ctx, x, y, tileSize: EDITOR_TILE, wallColor });
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 0.5;
    for (let col = 0; col <= MAZE_WIDTH; col++) {
      ctx.beginPath();
      ctx.moveTo(col * EDITOR_TILE, 0);
      ctx.lineTo(col * EDITOR_TILE, CANVAS_H);
      ctx.stroke();
    }
    for (let row = 0; row <= MAZE_HEIGHT; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * EDITOR_TILE);
      ctx.lineTo(CANVAS_W, row * EDITOR_TILE);
      ctx.stroke();
    }

    // Hover highlight
    if (hoverTile) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoverTile.col * EDITOR_TILE,
        hoverTile.row * EDITOR_TILE,
        EDITOR_TILE,
        EDITOR_TILE
      );
    }
  }, [maze, hoverTile, wallColor]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsPainting(false); setHoverTile(null); }}
        onContextMenu={handleContextMenu}
        id="editor-canvas"
      />
      <div className={styles.coords}>
        {hoverTile ? `(${hoverTile.col}, ${hoverTile.row})` : '—'}
      </div>
    </div>
  );
}
