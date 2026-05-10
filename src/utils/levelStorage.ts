import type { CustomLevel } from '../engine/types';

const STORAGE_KEY = 'pacman-custom-levels';
const HIGH_SCORE_KEY = 'pacman-high-score';

// ─── Level persistence ───────────────────────────────────────────────

export function loadLevels(): CustomLevel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLevels(levels: CustomLevel[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch {
    console.warn('Failed to save levels to localStorage');
  }
}

export function saveLevel(level: CustomLevel): void {
  const levels = loadLevels();
  const existingIndex = levels.findIndex(l => l.id === level.id);
  if (existingIndex >= 0) {
    levels[existingIndex] = level;
  } else {
    levels.push(level);
  }
  saveLevels(levels);
}

export function deleteLevel(id: string): void {
  const levels = loadLevels().filter(l => l.id !== id);
  saveLevels(levels);
}

export function generateLevelId(): string {
  return `level_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ─── Level import/export ─────────────────────────────────────────────

export function exportLevel(level: CustomLevel): string {
  return JSON.stringify(level);
}

export function importLevel(json: string): CustomLevel | null {
  try {
    const data = JSON.parse(json);
    if (data && data.maze && Array.isArray(data.maze)) {
      return {
        id: data.id || generateLevelId(),
        name: data.name || 'Imported Level',
        maze: data.maze,
        createdAt: data.createdAt || Date.now(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Level validation ────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateLevel(maze: number[][]): ValidationResult {
  const errors: string[] = [];

  if (maze.length < 10) {
    errors.push('Maze must have at least 10 rows');
  }
  if (maze[0]?.length < 10) {
    errors.push('Maze must have at least 10 columns');
  }

  // Check for Pacman spawn
  let hasPacmanSpawn = false;
  let dotCount = 0;
  let hasGhostHouse = false;

  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      if (maze[row][col] === 7) hasPacmanSpawn = true;
      if (maze[row][col] === 2 || maze[row][col] === 3) dotCount++;
      if (maze[row][col] === 4) hasGhostHouse = true;
    }
  }

  if (!hasPacmanSpawn) errors.push('Missing Pacman spawn point');
  if (dotCount === 0) errors.push('No dots or power pellets placed');
  if (!hasGhostHouse) errors.push('No ghost house area');

  return { valid: errors.length === 0, errors };
}

// ─── High Score ──────────────────────────────────────────────────────

export function loadHighScore(): number {
  try {
    const score = localStorage.getItem(HIGH_SCORE_KEY);
    return score ? parseInt(score, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch {
    console.warn('Failed to save high score');
  }
}

// ─── Blank maze generator ────────────────────────────────────────────

export function createBlankMaze(width: number = 28, height: number = 31): number[][] {
  const maze: number[][] = [];
  for (let row = 0; row < height; row++) {
    const r: number[] = [];
    for (let col = 0; col < width; col++) {
      // Border walls
      if (row === 0 || row === height - 1 || col === 0 || col === width - 1) {
        r.push(1); // WALL
      } else {
        r.push(0); // EMPTY
      }
    }
    maze.push(r);
  }
  return maze;
}
