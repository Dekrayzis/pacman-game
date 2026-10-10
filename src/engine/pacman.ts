import { Direction } from './types';
import type { PacmanState, TilePosition } from './types';
import {
  DISPLAY_TILE,
  MAZE_WIDTH,
  MOUTH_SPEED,
  DEATH_ANIMATION_DURATION,
} from './constants';
import { isWalkable, getDirectionDelta, getOppositeDirection, tileCenterX, tileCenterY } from './maze';

// ─── Create initial Pacman state ─────────────────────────────────────

export function createPacman(spawn: TilePosition, speed: number): PacmanState {
  return {
    position: {
      x: tileCenterX(spawn.col),
      y: tileCenterY(spawn.row),
    },
    tilePos: { col: spawn.col, row: spawn.row },
    direction: Direction.NONE,
    nextDirection: Direction.NONE,
    mouthAngle: 0.25,
    mouthOpening: true,
    speed,
    alive: true,
    deathAnimProgress: 0,
  };
}

// ─── Update Pacman position ──────────────────────────────────────────

export function updatePacman(pacman: PacmanState, maze: number[][]): void {
  if (!pacman.alive) {
    pacman.deathAnimProgress += 1 / DEATH_ANIMATION_DURATION;
    if (pacman.deathAnimProgress > 1) pacman.deathAnimProgress = 1;
    return;
  }

  // Animate mouth when moving
  if (pacman.direction !== Direction.NONE) {
    if (pacman.mouthOpening) {
      pacman.mouthAngle += MOUTH_SPEED;
      if (pacman.mouthAngle >= 0.35) pacman.mouthOpening = false;
    } else {
      pacman.mouthAngle -= MOUTH_SPEED;
      if (pacman.mouthAngle <= 0.02) pacman.mouthOpening = true;
    }
  }

  // If not moving, try to start from queued direction
  if (pacman.direction === Direction.NONE) {
    if (pacman.nextDirection !== Direction.NONE) {
      const delta = getDirectionDelta(pacman.nextDirection);
      const nextCol = pacman.tilePos.col + delta.col;
      const nextRow = pacman.tilePos.row + delta.row;
      if (isWalkable(maze, nextCol, nextRow)) {
        pacman.direction = pacman.nextDirection;
        pacman.nextDirection = Direction.NONE;
      }
    }
    return; // No movement this frame if still NONE
  }

  // Get current movement delta
  const moveDelta = getDirectionDelta(pacman.direction);

  // Calculate movement for this frame
  let newX = pacman.position.x + moveDelta.col * pacman.speed;
  let newY = pacman.position.y + moveDelta.row * pacman.speed;

  // Determine the NEXT tile center in our direction
  const nextTileCol = pacman.tilePos.col + moveDelta.col;
  const nextTileRow = pacman.tilePos.row + moveDelta.row;
  const nextCx = tileCenterX(nextTileCol);
  const nextCy = tileCenterY(nextTileRow);

  // Check if we're crossing from current tile into the next one
  let crossedCenter = false;

  if (moveDelta.col !== 0) {
    // Horizontal movement
    const prevDist = (pacman.position.x - nextCx) * moveDelta.col;
    const newDist = (newX - nextCx) * moveDelta.col;
    // We've crossed when the signed distance goes from negative to zero/positive
    if (prevDist < 0 && newDist >= 0) {
      crossedCenter = true;
    }
  } else if (moveDelta.row !== 0) {
    // Vertical movement
    const prevDist = (pacman.position.y - nextCy) * moveDelta.row;
    const newDist = (newY - nextCy) * moveDelta.row;
    if (prevDist < 0 && newDist >= 0) {
      crossedCenter = true;
    }
  }

  if (crossedCenter) {
    // We've arrived at the next tile center
    pacman.tilePos.col = nextTileCol;
    pacman.tilePos.row = nextTileRow;

    // Snap to center of new tile
    newX = tileCenterX(nextTileCol);
    newY = tileCenterY(nextTileRow);

    // Try queued direction change
    let turned = false;
    // Off the side of the maze (in a tunnel) there's nowhere to turn but back.
    const offMaze = nextTileCol < 0 || nextTileCol >= MAZE_WIDTH;
    const canTurn = !offMaze || pacman.nextDirection === getOppositeDirection(pacman.direction);
    if (canTurn && pacman.nextDirection !== Direction.NONE && pacman.nextDirection !== pacman.direction) {
      const turnDelta = getDirectionDelta(pacman.nextDirection);
      const turnCol = nextTileCol + turnDelta.col;
      const turnRow = nextTileRow + turnDelta.row;
      if (isWalkable(maze, turnCol, turnRow)) {
        pacman.direction = pacman.nextDirection;
        pacman.nextDirection = Direction.NONE;
        turned = true;
      }
    }

    if (!turned) {
      // Check if we can continue in the current direction
      const aheadCol = nextTileCol + moveDelta.col;
      const aheadRow = nextTileRow + moveDelta.row;
      if (!isWalkable(maze, aheadCol, aheadRow)) {
        // Hit a wall — stop at tile center
        pacman.direction = Direction.NONE;
      }
    }
  } else {
    // Between tile centers — tilePos stays at current tile
    // (do NOT update tilePos from pixel position, or we'll skip wall checks)
  }

  pacman.position.x = newX;
  pacman.position.y = newY;

  // Tunnel wrap
  if (pacman.position.x < -DISPLAY_TILE / 2) {
    pacman.position.x = MAZE_WIDTH * DISPLAY_TILE + DISPLAY_TILE / 2;
    pacman.tilePos.col = MAZE_WIDTH;
  } else if (pacman.position.x > MAZE_WIDTH * DISPLAY_TILE + DISPLAY_TILE / 2) {
    pacman.position.x = -DISPLAY_TILE / 2;
    pacman.tilePos.col = -1;
  }
}

// ─── Direction rotation lookup (object literal replaces switch) ──────

const DIRECTION_ROTATION: Record<Direction, number> = {
  [Direction.RIGHT]: 0,
  [Direction.DOWN]: Math.PI * 0.5,
  [Direction.LEFT]: Math.PI,
  [Direction.UP]: Math.PI * 1.5,
  [Direction.NONE]: 0,
};

// ─── Render Pacman ───────────────────────────────────────────────────

export function renderPacman(ctx: CanvasRenderingContext2D, pacman: PacmanState): void {
  const { position, direction, mouthAngle, alive, deathAnimProgress } = pacman;
  const radius = DISPLAY_TILE / 2 - 2;

  ctx.save();
  ctx.translate(position.x, position.y);

  if (!alive) {
    // Death animation — shrinking Pacman
    const angle = deathAnimProgress * Math.PI;
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1 - deathAnimProgress * 0.5), angle, Math.PI * 2 - angle);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Rotation based on direction
  ctx.rotate(DIRECTION_ROTATION[direction]);

  // Draw Pacman body
  ctx.fillStyle = '#FFFF00';
  ctx.shadowColor = 'rgba(255, 255, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(0, 0, radius, mouthAngle * Math.PI, (2 - mouthAngle) * Math.PI);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}
