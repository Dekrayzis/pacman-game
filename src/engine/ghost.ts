import {
  GhostName,
  GhostMode,
  Direction,
  TileType,
} from './types';
import type {
  GhostState,
  PacmanState,
  TilePosition,
} from './types';
import {
  MAZE_WIDTH,
  GHOST_SPAWN,
  GHOST_SCATTER_TARGETS,
  GHOST_COLORS,
  GHOST_HOUSE_CENTER,
  BASE_GHOST_SPEED,
  FRIGHTENED_GHOST_SPEED,
  EATEN_GHOST_SPEED,
  TUNNEL_SPEED,
  DISPLAY_TILE,
} from './constants';
import { getDirectionDelta, getOppositeDirection, getTile, tileCenterX, tileCenterY } from './maze';

// ─── Create a ghost ──────────────────────────────────────────────────

export function createGhost(name: GhostName): GhostState {
  const spawn = GHOST_SPAWN[name];
  return {
    name,
    position: {
      x: tileCenterX(spawn.col),
      y: tileCenterY(spawn.row),
    },
    tilePos: { col: spawn.col, row: spawn.row },
    direction: name === GhostName.BLINKY ? Direction.LEFT : Direction.UP,
    nextDirection: Direction.NONE,
    mode: GhostMode.SCATTER,
    previousMode: GhostMode.SCATTER,
    isInHouse: name !== GhostName.BLINKY,
    dotCounter: 0,
    speed: BASE_GHOST_SPEED,
    color: GHOST_COLORS[name],
    scatterTarget: GHOST_SCATTER_TARGETS[name],
  };
}

export function createAllGhosts(): GhostState[] {
  return [
    createGhost(GhostName.BLINKY),
    createGhost(GhostName.PINKY),
    createGhost(GhostName.INKY),
    createGhost(GhostName.CLYDE),
  ];
}

// ─── Ghost AI targeting (object literals replace switches) ───────────

const CHASE_STRATEGIES: Record<GhostName, (ghost: GhostState, pacman: PacmanState, blinky: GhostState) => TilePosition> = {
  [GhostName.BLINKY]: (_ghost, pacman) =>
    ({ col: pacman.tilePos.col, row: pacman.tilePos.row }),

  [GhostName.PINKY]: (_ghost, pacman) => {
    const delta = getDirectionDelta(pacman.direction);
    return {
      col: pacman.tilePos.col + delta.col * 4,
      row: pacman.tilePos.row + delta.row * 4,
    };
  },

  [GhostName.INKY]: (_ghost, pacman, blinky) => {
    const delta = getDirectionDelta(pacman.direction);
    const ahead = {
      col: pacman.tilePos.col + delta.col * 2,
      row: pacman.tilePos.row + delta.row * 2,
    };
    return {
      col: ahead.col + (ahead.col - blinky.tilePos.col),
      row: ahead.row + (ahead.row - blinky.tilePos.row),
    };
  },

  [GhostName.CLYDE]: (ghost, pacman) => {
    const dx = ghost.tilePos.col - pacman.tilePos.col;
    const dy = ghost.tilePos.row - pacman.tilePos.row;
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      return { col: pacman.tilePos.col, row: pacman.tilePos.row };
    }
    return ghost.scatterTarget;
  },
};

function getChaseTarget(ghost: GhostState, pacman: PacmanState, blinky: GhostState): TilePosition {
  return CHASE_STRATEGIES[ghost.name](ghost, pacman, blinky);
}

const TARGET_BY_MODE: Record<GhostMode, (ghost: GhostState, pacman: PacmanState, blinky: GhostState) => TilePosition> = {
  [GhostMode.SCATTER]: (ghost) => ghost.scatterTarget,
  [GhostMode.CHASE]: (ghost, pacman, blinky) => getChaseTarget(ghost, pacman, blinky),
  [GhostMode.EATEN]: () => GHOST_HOUSE_CENTER,
  [GhostMode.FRIGHTENED]: () => ({ col: 0, row: 0 }),
};

function getTargetTile(ghost: GhostState, pacman: PacmanState, blinky: GhostState): TilePosition {
  return TARGET_BY_MODE[ghost.mode](ghost, pacman, blinky);
}

// ─── Direction choosing ──────────────────────────────────────────────

function distanceSq(a: TilePosition, b: TilePosition): number {
  return (a.col - b.col) ** 2 + (a.row - b.row) ** 2;
}

/** Off the side of the maze: the stretch a tunnel wraps through. */
function isOffMaze(col: number): boolean {
  return col < 0 || col >= MAZE_WIDTH;
}

function isGhostWalkable(maze: number[][], col: number, row: number, ghost: GhostState): boolean {
  if (row < 0 || row >= maze.length) return false;
  // Like Pac-Man, a ghost may step off the side of the maze and wrap round,
  // but only through a tunnel: from a TUNNEL tile at the edge of the row.
  if (isOffMaze(col)) {
    return getTile(maze, col < 0 ? 0 : MAZE_WIDTH - 1, row) === TileType.TUNNEL;
  }
  const tile = getTile(maze, col, row);
  if (tile === TileType.WALL) return false;
  if (tile === TileType.GHOST_HOUSE && !ghost.isInHouse && ghost.mode !== GhostMode.EATEN) return false;
  return true;
}

function chooseDirection(
  ghost: GhostState,
  target: TilePosition,
  maze: number[][]
): Direction {
  // Off the side of the maze a ghost is inside a tunnel: it keeps going until
  // it has wrapped back in, so it can't turn off into the void.
  if (isOffMaze(ghost.tilePos.col) && ghost.direction !== Direction.NONE) {
    return ghost.direction;
  }

  const opposite = getOppositeDirection(ghost.direction);
  const candidates: Direction[] = [Direction.UP, Direction.LEFT, Direction.DOWN, Direction.RIGHT];

  if (ghost.mode === GhostMode.FRIGHTENED) {
    // Random direction at intersections
    const valid = candidates.filter(dir => {
      if (dir === opposite) return false;
      const delta = getDirectionDelta(dir);
      return isGhostWalkable(maze, ghost.tilePos.col + delta.col, ghost.tilePos.row + delta.row, ghost);
    });
    if (valid.length === 0) return opposite;
    return valid[Math.floor(Math.random() * valid.length)];
  }

  // Standard ghost AI: choose direction closest to target, never reverse
  let bestDir: Direction = Direction.NONE;
  let bestDist = Infinity;

  for (const dir of candidates) {
    if (dir === opposite) continue;
    const delta = getDirectionDelta(dir);
    const nextCol = ghost.tilePos.col + delta.col;
    const nextRow = ghost.tilePos.row + delta.row;

    if (!isGhostWalkable(maze, nextCol, nextRow, ghost)) continue;

    const dist = distanceSq({ col: nextCol, row: nextRow }, target);
    if (dist < bestDist) {
      bestDist = dist;
      bestDir = dir;
    }
  }

  // If no forward direction, allow reverse as last resort
  if (bestDir === Direction.NONE) {
    bestDir = opposite;
  }

  return bestDir;
}

// ─── Ghost speed lookup (object literal replaces switch) ─────────────

const GHOST_SPEED_BY_MODE: Record<GhostMode, number> = {
  [GhostMode.FRIGHTENED]: FRIGHTENED_GHOST_SPEED,
  [GhostMode.EATEN]: EATEN_GHOST_SPEED,
  [GhostMode.SCATTER]: BASE_GHOST_SPEED,
  [GhostMode.CHASE]: BASE_GHOST_SPEED,
};

/**
 * In a tunnel, as in the arcade: off the side of the maze, or in a row that
 * opens onto a tunnel tile at the edge, on the walled-in stretch between that
 * edge and the first tile with an opening above or below.
 */
function isInTunnel(maze: number[][], col: number, row: number): boolean {
  if (isOffMaze(col)) return true;
  const isWalled = (c: number) =>
    getTile(maze, c, row - 1) === TileType.WALL && getTile(maze, c, row + 1) === TileType.WALL;

  if (getTile(maze, 0, row) === TileType.TUNNEL) {
    let c = 0;
    while (c < MAZE_WIDTH && isWalled(c)) c++;
    if (col < c) return true;
  }
  if (getTile(maze, MAZE_WIDTH - 1, row) === TileType.TUNNEL) {
    let c = MAZE_WIDTH - 1;
    while (c >= 0 && isWalled(c)) c--;
    if (col > c) return true;
  }
  return false;
}

function getGhostSpeed(ghost: GhostState, maze: number[][], speedMultiplier: number): number {
  const modeSpeed = GHOST_SPEED_BY_MODE[ghost.mode];
  // Eyes heading home aren't slowed by the tunnel.
  if (!ghost.isInHouse && ghost.mode !== GhostMode.EATEN
    && isInTunnel(maze, ghost.tilePos.col, ghost.tilePos.row)) {
    return Math.min(modeSpeed, TUNNEL_SPEED) * speedMultiplier;
  }
  return modeSpeed * speedMultiplier;
}

// ─── Update ghost ────────────────────────────────────────────────────

/**
 * One 60 Hz step for a ghost. `speedMultiplier` is the level's ghost speed
 * multiplier, applied on top of the mode's (and the tunnel's) speed.
 */
export function updateGhost(
  ghost: GhostState,
  maze: number[][],
  pacman: PacmanState,
  blinky: GhostState,
  speedMultiplier: number = 1
): void {
  ghost.speed = getGhostSpeed(ghost, maze, speedMultiplier);

  // Handle ghost house
  if (ghost.isInHouse) {
    if (ghost.dotCounter === -1) {
      // Ready to exit — animate toward the door
      const doorX = tileCenterX(GHOST_HOUSE_CENTER.col);
      const doorY = tileCenterY(GHOST_HOUSE_CENTER.row - 3);

      // Each step goes no further than the door, so a fast ghost can't step
      // past it and keep going.
      const toDoorX = doorX - ghost.position.x;
      const toDoorY = doorY - ghost.position.y;
      if (Math.abs(toDoorX) > 2) {
        ghost.position.x += Math.sign(toDoorX) * Math.min(ghost.speed, Math.abs(toDoorX));
      } else if (Math.abs(toDoorY) > 2) {
        ghost.position.y += Math.sign(toDoorY) * Math.min(ghost.speed, Math.abs(toDoorY));
      } else {
        ghost.isInHouse = false;
        ghost.position.x = doorX;
        ghost.position.y = doorY;
        ghost.tilePos = {
          col: GHOST_HOUSE_CENTER.col,
          row: GHOST_HOUSE_CENTER.row - 3,
        };
        ghost.direction = Direction.LEFT;
      }
    } else {
      // Waiting in house — bob up and down
      ghost.dotCounter++;
      const bobOffset = Math.sin(ghost.dotCounter * 0.1) * 3;
      const homeY = tileCenterY(GHOST_SPAWN[ghost.name].row);
      ghost.position.y = homeY + bobOffset;
    }
    return;
  }

  // Check if arrived at ghost house when eaten
  if (ghost.mode === GhostMode.EATEN) {
    const houseX = tileCenterX(GHOST_HOUSE_CENTER.col);
    const houseY = tileCenterY(GHOST_HOUSE_CENTER.row);
    if (Math.abs(ghost.position.x - houseX) < 4 && Math.abs(ghost.position.y - houseY) < 4) {
      ghost.mode = ghost.previousMode;
      ghost.isInHouse = true;
      ghost.position.x = houseX;
      ghost.position.y = houseY;
      return;
    }
  }

  // Ghost movement using crossed-center approach
  const moveDelta = getDirectionDelta(ghost.direction);

  let newX = ghost.position.x + moveDelta.col * ghost.speed;
  let newY = ghost.position.y + moveDelta.row * ghost.speed;

  // Check if we've crossed into the next tile center
  const nextTileCol = ghost.tilePos.col + moveDelta.col;
  const nextTileRow = ghost.tilePos.row + moveDelta.row;
  const nextCx = tileCenterX(nextTileCol);
  const nextCy = tileCenterY(nextTileRow);

  let crossedCenter = false;

  if (moveDelta.col !== 0) {
    const prevDist = (ghost.position.x - nextCx) * moveDelta.col;
    const newDist = (newX - nextCx) * moveDelta.col;
    if (prevDist < 0 && newDist >= 0) crossedCenter = true;
  } else if (moveDelta.row !== 0) {
    const prevDist = (ghost.position.y - nextCy) * moveDelta.row;
    const newDist = (newY - nextCy) * moveDelta.row;
    if (prevDist < 0 && newDist >= 0) crossedCenter = true;
  } else {
    // No direction — need to pick a direction
    crossedCenter = true;
    newX = ghost.position.x;
    newY = ghost.position.y;
  }

  if (crossedCenter) {
    ghost.tilePos.col = ghost.direction === Direction.NONE ? ghost.tilePos.col : nextTileCol;
    ghost.tilePos.row = ghost.direction === Direction.NONE ? ghost.tilePos.row : nextTileRow;
    newX = tileCenterX(ghost.tilePos.col);
    newY = tileCenterY(ghost.tilePos.row);

    const target = getTargetTile(ghost, pacman, blinky);
    ghost.direction = chooseDirection(ghost, target, maze);
  }

  ghost.position.x = newX;
  ghost.position.y = newY;

  // tilePos is only updated in the crossedCenter block above
  // (do NOT recalculate from pixels, or we'll skip wall checks)

  // Tunnel wrap, as for Pac-Man: past the centre of the off-maze tile on one
  // side, reappear at the centre of the off-maze tile on the other.
  if (ghost.position.x < -DISPLAY_TILE / 2) {
    ghost.position.x = MAZE_WIDTH * DISPLAY_TILE + DISPLAY_TILE / 2;
    ghost.tilePos.col = MAZE_WIDTH;
  } else if (ghost.position.x > MAZE_WIDTH * DISPLAY_TILE + DISPLAY_TILE / 2) {
    ghost.position.x = -DISPLAY_TILE / 2;
    ghost.tilePos.col = -1;
  }
}

// ─── Set ghost mode ──────────────────────────────────────────────────

export function setGhostMode(ghost: GhostState, mode: GhostMode): void {
  if (ghost.mode === GhostMode.EATEN) return; // Don't interrupt eaten mode
  if (ghost.isInHouse) {
    ghost.previousMode = mode;
    return;
  }

  if (mode === GhostMode.FRIGHTENED) {
    ghost.previousMode = ghost.mode;
    ghost.mode = GhostMode.FRIGHTENED;
    // Reverse direction when entering frightened
    ghost.direction = getOppositeDirection(ghost.direction);
  } else {
    if (ghost.mode === GhostMode.FRIGHTENED) {
      ghost.mode = ghost.previousMode;
    } else {
      ghost.previousMode = ghost.mode;
      ghost.mode = mode;
      // Reverse direction on scatter/chase transition
      ghost.direction = getOppositeDirection(ghost.direction);
    }
  }
}
