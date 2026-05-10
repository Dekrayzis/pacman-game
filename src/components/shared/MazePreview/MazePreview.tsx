import { TileType } from '../../../engine/types';
import { TILE_COLORS } from '../../../engine/constants';
import styles from './MazePreview.module.scss';

// ─── Component ───────────────────────────────────────────────────────

interface MazePreviewProps {
  maze: number[][];
  rows?: number;
  cols?: number;
  wallColor?: string;
  className?: string;
}

function getTileColor(tile: number, wallColor: string): string {
  if (tile === TileType.WALL) return wallColor;
  return TILE_COLORS[tile] ?? 'transparent';
}

function getTileOpacity(tile: number): number {
  return tile === TileType.DOT ? 0.4 : 1;
}

export default function MazePreview({
  maze,
  rows = 15,
  cols = 14,
  wallColor = '#2121DE',
  className,
}: MazePreviewProps) {
  return (
    <div className={`${styles.preview} ${className ?? ''}`}>
      {maze.slice(0, rows).map((row, ri) => (
        <div key={ri} className={styles.row}>
          {row.slice(0, cols).map((tile, ci) => (
            <div
              key={ci}
              className={styles.tile}
              style={{
                backgroundColor: getTileColor(tile, wallColor),
                opacity: getTileOpacity(tile),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
