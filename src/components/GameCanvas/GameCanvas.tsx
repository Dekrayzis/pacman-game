import { useRef, useCallback, useState, useEffect } from 'react';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardInput } from '../../hooks/useKeyboardInput';
import {
  GamePhase,
  GhostMode,
  TileType,
} from '../../engine/types';
import type { GameState } from '../../engine/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BASE_PACMAN_SPEED,
  BASE_GHOST_SPEED,
  INITIAL_LIVES,
  READY_DURATION,
  FRUIT_SPAWN,
} from '../../engine/constants';
import { cloneMaze, countDots, findPacmanSpawn } from '../../engine/maze';
import { createPacman } from '../../engine/pacman';
import { createAllGhosts } from '../../engine/ghost';
import { playSound } from '../../engine/audio';
import { loadHighScore, saveHighScore } from '../../utils/levelStorage';
import { updateGameState } from '../../engine/updateGame';
import { renderGameFrame } from '../../engine/renderGame';
import { getLevelConfig } from '../../engine/levels';
import type { LevelConfig } from '../../engine/levels';
import styles from './GameCanvas.module.scss';

interface GameCanvasProps {
  maze?: number[][];
  onGameOver: (score: number, highScore: number) => void;
  onScoreChange: (score: number, highScore: number, lives: number, level: number) => void;
  wallColor?: string;
  campaignMode?: boolean;
}

export default function GameCanvas({
  maze: customMaze,
  onGameOver,
  onScoreChange,
  wallColor: customWallColor,
  campaignMode = true,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const frameCountRef = useRef(0);
  const levelConfigRef = useRef<LevelConfig | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize game for a specific level
  const initGame = useCallback((level: number = 1, score: number = 0, lives: number = INITIAL_LIVES) => {
    // In campaign mode, select maze from level configs; otherwise use the custom maze
    const config = campaignMode ? getLevelConfig(level) : null;
    const mazeData = config?.maze ?? customMaze!;
    const gameMaze = cloneMaze(mazeData);
    const spawn = findPacmanSpawn(gameMaze);
    gameMaze[spawn.row][spawn.col] = TileType.EMPTY;

    const totalDots = countDots(gameMaze);
    const speedMult = config?.ghostSpeedMultiplier ?? 1;
    const pacmanMult = config?.pacmanSpeedMultiplier ?? 1;

    levelConfigRef.current = config;

    const state: GameState = {
      phase: GamePhase.READY,
      score,
      highScore: loadHighScore(),
      lives,
      level,
      dotsRemaining: totalDots,
      totalDots,
      ghostsEatenCombo: 0,
      frightenedTimeLeft: 0,
      readyTimer: READY_DURATION,
      maze: gameMaze,
      pacman: createPacman(spawn, BASE_PACMAN_SPEED * pacmanMult),
      ghosts: createAllGhosts(),
      fruitActive: false,
      fruitTimer: 0,
      fruitType: level - 1,
      fruitPosition: FRUIT_SPAWN,
      modeTimer: 0,
      modeIndex: 0,
      globalMode: GhostMode.SCATTER,
    };

    // Apply ghost speed multiplier
    state.ghosts.forEach(g => {
      g.speed = BASE_GHOST_SPEED * speedMult;
    });

    gameStateRef.current = state;
    onScoreChange(state.score, state.highScore, state.lives, state.level);
    setIsRunning(true);
  }, [campaignMode, customMaze, onScoreChange]);

  // Initialize on mount
  useEffect(() => {
    initGame(1);
  }, [initGame]);

  // Keyboard input
  useKeyboardInput(gameStateRef);

  // Game loop: run the steps that are due (see useGameLoop), then draw once.
  const gameLoop = useCallback((steps: number) => {
    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!state || !canvas || steps === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the current level's maze (for respawning)
    const config = levelConfigRef.current;
    const levelMaze = config?.maze ?? customMaze!;

    let scoreChanged = false;
    for (let i = 0; i < steps; i++) {
      frameCountRef.current++;
      const result = updateGameState(state, levelMaze, playSound, config ?? undefined);

      if (result.gameOver) {
        saveHighScore(state.highScore);
        onGameOver(state.score, state.highScore);
        setIsRunning(false);
        return;
      }

      if (result.levelComplete) {
        initGame(state.level + 1, state.score, state.lives);
        return;
      }

      scoreChanged ||= result.scoreChanged;
    }

    if (scoreChanged) {
      onScoreChange(state.score, state.highScore, state.lives, state.level);
    }

    // Render with dynamic wall color
    const wallColor = config?.wallColor ?? customWallColor ?? '#2121DE';
    renderGameFrame(ctx, state, frameCountRef.current, wallColor);
  }, [customMaze, customWallColor, onGameOver, onScoreChange, initGame]);

  useGameLoop(gameLoop, isRunning);

  return (
    <div className={styles.canvasWrapper}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={styles.canvas}
        id="game-canvas"
      />
    </div>
  );
}
