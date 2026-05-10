import {
  GamePhase,
  GhostMode,
} from './types';
import type { GameState } from './types';
import {
  BASE_PACMAN_SPEED,
  BASE_GHOST_SPEED,
  READY_DURATION,
  LEVEL_COMPLETE_DURATION,
  FRIGHTENED_DURATION,
  MODE_SCHEDULE,
  FRUIT_APPEAR_DOTS,
  FRUIT_DURATION,
  GHOST_DOT_LIMITS,
} from './constants';
import { findPacmanSpawn } from './maze';
import { createPacman, updatePacman } from './pacman';
import { createAllGhosts, updateGhost, setGhostMode } from './ghost';
import { checkCollisions } from './collision';
import type { LevelConfig } from './levels';

// ─── Game update result ──────────────────────────────────────────────

export interface GameUpdateResult {
  gameOver: boolean;
  levelComplete: boolean;
  scoreChanged: boolean;
}

// ─── Phase handlers ──────────────────────────────────────────────────

function handleReadyPhase(state: GameState): void {
  state.readyTimer--;
  if (state.readyTimer <= 0) {
    state.phase = GamePhase.PLAYING;
  }
}

function handlePlayingPhase(
  state: GameState,
  playSound: (sound: string) => void,
  result: GameUpdateResult,
  levelConfig?: LevelConfig,
): void {
  const { pacman, ghosts, maze } = state;

  // Update Pacman
  updatePacman(pacman, maze);

  // Update ghost mode timer (pause while ghosts are frightened)
  if (state.frightenedTimeLeft <= 0) {
    state.modeTimer++;
  }

  if (state.modeIndex < MODE_SCHEDULE.length) {
    const { duration } = MODE_SCHEDULE[state.modeIndex];
    if (state.modeTimer >= duration) {
      state.modeTimer = 0;
      state.modeIndex++;
      if (state.modeIndex < MODE_SCHEDULE.length) {
        state.globalMode = MODE_SCHEDULE[state.modeIndex].mode;
        ghosts.forEach(g => setGhostMode(g, state.globalMode));
      }
    }
  }

  // Update frightened timer
  if (state.frightenedTimeLeft > 0) {
    state.frightenedTimeLeft--;
    if (state.frightenedTimeLeft <= 0) {
      ghosts.forEach(g => {
        if (g.mode === GhostMode.FRIGHTENED) {
          g.mode = g.previousMode;
        }
      });
      state.ghostsEatenCombo = 0;
    }
  }

  // Release ghosts based on dots eaten
  const dotsEaten = state.totalDots - state.dotsRemaining;
  ghosts.forEach(g => {
    if (g.isInHouse && dotsEaten >= GHOST_DOT_LIMITS[g.name]) {
      g.dotCounter = -1;
    }
  });

  // Update ghosts
  const blinky = ghosts[0];
  ghosts.forEach(ghost => updateGhost(ghost, maze, pacman, blinky));

  // Check collisions (pass level-specific frightened duration)
  const frightenedDur = levelConfig?.frightenedDuration ?? FRIGHTENED_DURATION;
  checkCollisions(state, playSound, frightenedDur);

  // Fruit logic
  if (!state.fruitActive && FRUIT_APPEAR_DOTS.includes(dotsEaten)) {
    state.fruitActive = true;
    state.fruitTimer = FRUIT_DURATION;
  }
  if (state.fruitActive) {
    state.fruitTimer--;
    if (state.fruitTimer <= 0) {
      state.fruitActive = false;
    }
  }

  result.scoreChanged = true;

  // Transition to dying or level complete
  if (!pacman.alive) {
    state.phase = GamePhase.DYING;
  } else if (state.dotsRemaining <= 0) {
    state.phase = GamePhase.LEVEL_COMPLETE;
    state.readyTimer = LEVEL_COMPLETE_DURATION;
    playSound('level_complete');
  }
}

function handleDyingPhase(
  state: GameState,
  initialMaze: number[][],
  result: GameUpdateResult,
  levelConfig?: LevelConfig,
): void {
  const { pacman } = state;

  updatePacman(pacman, state.maze);

  if (pacman.deathAnimProgress < 1) return;

  state.lives--;

  if (state.lives <= 0) {
    state.phase = GamePhase.GAME_OVER;
    result.gameOver = true;
    return;
  }

  // Respawn with level-appropriate speeds
  const pacmanMult = levelConfig?.pacmanSpeedMultiplier ?? 1;
  const ghostMult = levelConfig?.ghostSpeedMultiplier ?? 1;
  const spawn = findPacmanSpawn(initialMaze);
  state.pacman = createPacman(spawn, BASE_PACMAN_SPEED * pacmanMult);
  state.ghosts = createAllGhosts();
  state.ghosts.forEach(g => { g.speed = BASE_GHOST_SPEED * ghostMult; });
  state.phase = GamePhase.READY;
  state.readyTimer = READY_DURATION;
  state.frightenedTimeLeft = 0;
  state.modeTimer = 0;
  state.modeIndex = 0;
  state.globalMode = GhostMode.SCATTER;
  result.scoreChanged = true;
}

function handleLevelCompletePhase(state: GameState, result: GameUpdateResult): void {
  state.readyTimer--;
  if (state.readyTimer <= 0) {
    result.levelComplete = true;
  }
}

// ─── Phase dispatch (object literal replaces if-chain) ───────────────

type PhaseHandler = (
  state: GameState,
  initialMaze: number[][],
  playSound: (sound: string) => void,
  result: GameUpdateResult,
  levelConfig?: LevelConfig,
) => void;

const PHASE_HANDLERS: Partial<Record<GamePhase, PhaseHandler>> = {
  [GamePhase.READY]: (state) =>
    handleReadyPhase(state),

  [GamePhase.PLAYING]: (state, _initialMaze, playSound, result, levelConfig) =>
    handlePlayingPhase(state, playSound, result, levelConfig),

  [GamePhase.DYING]: (state, initialMaze, _playSound, result, levelConfig) =>
    handleDyingPhase(state, initialMaze, result, levelConfig),

  [GamePhase.LEVEL_COMPLETE]: (state, _initialMaze, _playSound, result) =>
    handleLevelCompletePhase(state, result),
};

// ─── Update game state ──────────────────────────────────────────────

export function updateGameState(
  state: GameState,
  initialMaze: number[][],
  playSound: (sound: string) => void,
  levelConfig?: LevelConfig,
): GameUpdateResult {
  const result: GameUpdateResult = {
    gameOver: false,
    levelComplete: false,
    scoreChanged: false,
  };

  PHASE_HANDLERS[state.phase]?.(state, initialMaze, playSound, result, levelConfig);

  return result;
}
