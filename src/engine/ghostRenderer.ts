import { GhostMode, Direction } from './types';
import type { GhostState } from './types';
import { DISPLAY_TILE } from './constants';

// ─── Pupil offset lookup ─────────────────────────────────────────────

const PUPIL_OFFSETS: Record<string, { x: number; y: number }> = {
  [Direction.LEFT]: { x: -2, y: 0 },
  [Direction.RIGHT]: { x: 2, y: 0 },
  [Direction.UP]: { x: 0, y: -2 },
  [Direction.DOWN]: { x: 0, y: 2 },
  [Direction.NONE]: { x: 0, y: 0 },
};

export function getDirectionPupilOffset(direction: Direction): { x: number; y: number } {
  return PUPIL_OFFSETS[direction] ?? { x: 0, y: 0 };
}

// ─── Draw ghost body (dome + wavy skirt) ─────────────────────────────

export function drawGhostBody(
  ctx: CanvasRenderingContext2D,
  color: string,
  size: number,
  glowColor?: string,
): void {
  const halfSize = size / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -2, halfSize, Math.PI, 0);
  ctx.lineTo(halfSize, halfSize - 2);

  const waveCount = 3;
  const waveWidth = size / waveCount;
  for (let i = 0; i < waveCount; i++) {
    const wx = halfSize - i * waveWidth;
    const nextWx = wx - waveWidth;
    const waveDir = i % 2 === 0 ? 4 : -4;
    ctx.quadraticCurveTo(wx - waveWidth / 2, halfSize - 2 + waveDir, nextWx, halfSize - 2);
  }

  ctx.closePath();
  ctx.shadowColor = glowColor ?? color;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── Draw ghost eyes ─────────────────────────────────────────────────

export function drawGhostEyes(
  ctx: CanvasRenderingContext2D,
  pupilOffsetX: number = 0,
  pupilOffsetY: number = 0,
): void {
  // Eye whites
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-5, -5, 5, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(5, -5, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#2121DE';
  ctx.beginPath();
  ctx.arc(-5 + pupilOffsetX, -5 + pupilOffsetY, 2.5, 0, Math.PI * 2);
  ctx.arc(5 + pupilOffsetX, -5 + pupilOffsetY, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Draw frightened face ────────────────────────────────────────────

function drawFrightenedFace(ctx: CanvasRenderingContext2D, flashWhite: boolean): void {
  const faceColor = flashWhite ? '#FF0000' : '#FFFFFF';

  // Eyes as simple dots
  ctx.fillStyle = faceColor;
  ctx.beginPath();
  ctx.arc(-5, -5, 2.5, 0, Math.PI * 2);
  ctx.arc(5, -5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Wavy mouth
  ctx.strokeStyle = faceColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-7, 3);
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(-7 + i * 3.5, i % 2 === 0 ? 3 : 6);
  }
  ctx.stroke();
}

// ─── Render complete ghost ───────────────────────────────────────────

export function renderGhost(
  ctx: CanvasRenderingContext2D,
  ghost: GhostState,
  flashWhite: boolean,
): void {
  const { position, mode } = ghost;
  const size = DISPLAY_TILE - 4;

  ctx.save();
  ctx.translate(position.x, position.y);

  if (mode === GhostMode.EATEN) {
    const { x, y } = getDirectionPupilOffset(ghost.direction);
    drawGhostEyes(ctx, x, y);
    ctx.restore();
    return;
  }

  // Body color and glow
  const bodyColor = mode === GhostMode.FRIGHTENED
    ? (flashWhite ? '#FFFFFF' : '#2121FF')
    : ghost.color;

  const glowColor = mode === GhostMode.FRIGHTENED
    ? 'rgba(33, 33, 255, 0.5)'
    : ghost.color;

  drawGhostBody(ctx, bodyColor, size, glowColor);

  // Face
  if (mode === GhostMode.FRIGHTENED) {
    drawFrightenedFace(ctx, flashWhite);
  } else {
    const { x, y } = getDirectionPupilOffset(ghost.direction);
    drawGhostEyes(ctx, x, y);
  }

  ctx.restore();
}
