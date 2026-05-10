import { useState, useCallback } from 'react';
import { TileType } from '../../engine/types';
import type { CustomLevel } from '../../engine/types';
import { CLASSIC_MAZE, cloneMaze } from '../../engine/maze';
import { MAZE_WIDTH, MAZE_HEIGHT } from '../../engine/constants';
import {
  saveLevel,
  generateLevelId,
  loadLevels,
  deleteLevel,
  validateLevel,
  createBlankMaze,
  exportLevel,
  importLevel,
} from '../../utils/levelStorage';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useToastMessage } from '../../hooks/useToastMessage';
import EditorCanvas from './EditorCanvas';
import ToolPalette from './ToolPalette';
import LevelBrowser from './LevelBrowser';
import styles from './LevelEditor.module.scss';

interface LevelEditorProps {
  onBack: () => void;
  onPlayTest: (maze: number[][], wallColor?: string) => void;
}

export default function LevelEditor({ onBack, onPlayTest }: LevelEditorProps) {
  const [maze, setMaze] = useState<number[][]>(() => createBlankMaze(MAZE_WIDTH, MAZE_HEIGHT));
  const [selectedTool, setSelectedTool] = useState<TileType>(TileType.WALL);
  const [levelName, setLevelName] = useState('My Level');
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
  const [levels, setLevels] = useState<CustomLevel[]>(() => loadLevels());
  const [wallColor, setWallColor] = useState('#2121DE');

  const { message, show: showMessage } = useToastMessage();
  const { push: pushUndo, undo, redo, canUndo, canRedo } = useUndoRedo<number[][]>(cloneMaze);

  const handleTilePaint = useCallback((col: number, row: number) => {
    setMaze(prev => {
      const newMaze = cloneMaze(prev);
      // Only one Pacman spawn allowed
      if (selectedTool === TileType.PACMAN_SPAWN) {
        for (let r = 0; r < newMaze.length; r++) {
          for (let c = 0; c < newMaze[r].length; c++) {
            if (newMaze[r][c] === TileType.PACMAN_SPAWN) {
              newMaze[r][c] = TileType.EMPTY;
            }
          }
        }
      }
      newMaze[row][col] = selectedTool;
      return newMaze;
    });
  }, [selectedTool]);

  const handlePaintStart = useCallback(() => {
    pushUndo(maze);
  }, [pushUndo, maze]);

  const handleUndo = useCallback(() => {
    const prev = undo(maze);
    if (prev) setMaze(prev);
  }, [undo, maze]);

  const handleRedo = useCallback(() => {
    const next = redo(maze);
    if (next) setMaze(next);
  }, [redo, maze]);

  const handleSave = useCallback(() => {
    const validation = validateLevel(maze);
    if (!validation.valid) {
      showMessage(validation.errors[0], 'error');
      return;
    }

    const level: CustomLevel = {
      id: currentLevelId || generateLevelId(),
      name: levelName,
      maze: cloneMaze(maze),
      createdAt: Date.now(),
    };

    saveLevel(level);
    setCurrentLevelId(level.id);
    setLevels(loadLevels());
    showMessage('Level saved!', 'success');
  }, [maze, levelName, currentLevelId, showMessage]);

  const handleLoad = useCallback((level: CustomLevel) => {
    pushUndo(maze);
    setMaze(cloneMaze(level.maze));
    setLevelName(level.name);
    setCurrentLevelId(level.id);
    showMessage(`Loaded "${level.name}"`, 'info');
  }, [pushUndo, maze, showMessage]);

  const handleDelete = useCallback((id: string) => {
    deleteLevel(id);
    setLevels(loadLevels());
    if (currentLevelId === id) {
      setCurrentLevelId(null);
    }
    showMessage('Level deleted', 'info');
  }, [currentLevelId, showMessage]);

  const handlePlayTest = useCallback(() => {
    const validation = validateLevel(maze);
    if (!validation.valid) {
      showMessage(validation.errors[0], 'error');
      return;
    }
    onPlayTest(maze, wallColor);
  }, [maze, wallColor, onPlayTest, showMessage]);

  const handleClear = useCallback(() => {
    pushUndo(maze);
    setMaze(createBlankMaze(MAZE_WIDTH, MAZE_HEIGHT));
    showMessage('Canvas cleared', 'info');
  }, [pushUndo, maze, showMessage]);

  const handleLoadClassic = useCallback(() => {
    pushUndo(maze);
    setMaze(cloneMaze(CLASSIC_MAZE));
    setLevelName('Classic');
    showMessage('Classic maze loaded', 'info');
  }, [pushUndo, maze, showMessage]);

  const handleExport = useCallback(() => {
    const level: CustomLevel = {
      id: currentLevelId || generateLevelId(),
      name: levelName,
      maze: cloneMaze(maze),
      createdAt: Date.now(),
    };
    navigator.clipboard.writeText(exportLevel(level));
    showMessage('Level copied to clipboard!', 'success');
  }, [maze, levelName, currentLevelId, showMessage]);

  const handleImport = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const level = importLevel(text);
      if (level) {
        pushUndo(maze);
        setMaze(cloneMaze(level.maze));
        setLevelName(level.name);
        showMessage(`Imported "${level.name}"`, 'success');
      } else {
        showMessage('Invalid level data', 'error');
      }
    } catch {
      showMessage('Failed to read clipboard', 'error');
    }
  }, [pushUndo, maze, showMessage]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    } else if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    } else if (e.key >= '1' && e.key <= '7') {
      const tools = [TileType.WALL, TileType.DOT, TileType.POWER_PELLET, TileType.EMPTY, TileType.GHOST_HOUSE, TileType.GHOST_DOOR, TileType.PACMAN_SPAWN];
      setSelectedTool(tools[parseInt(e.key) - 1]);
    }
  }, [handleUndo, handleRedo, handleSave]);

  return (
    <div className={styles.editor} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack} id="editor-back-btn">
          ← BACK
        </button>
        <div className={styles.titleArea}>
          <input
            className={styles.levelNameInput}
            value={levelName}
            onChange={e => setLevelName(e.target.value)}
            maxLength={24}
            placeholder="Level name..."
            id="level-name-input"
          />
        </div>
        <div className={styles.headerActions}>
          {[
            { id: undefined, label: '↶', className: styles.actionButton, onClick: handleUndo, disabled: !canUndo, title: 'Undo (Ctrl+Z)' },
            { id: undefined, label: '↷', className: styles.actionButton, onClick: handleRedo, disabled: !canRedo, title: 'Redo (Ctrl+Y)' },
            { id: 'save-level-btn', label: '💾 SAVE', className: styles.saveButton, onClick: handleSave, title: 'Save (Ctrl+S)' },
            { id: 'play-test-btn', label: '▶ TEST', className: styles.playButton, onClick: handlePlayTest },
          ].map(({ id, label, className, onClick, disabled, title }) => (
            <button key={label} id={id} className={className} onClick={onClick} disabled={disabled} title={title}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <div className={`${styles.toast} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Main layout */}
      <div className={styles.body}>
        <ToolPalette
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          onClear={handleClear}
          onLoadClassic={handleLoadClassic}
          onExport={handleExport}
          onImport={handleImport}
          wallColor={wallColor}
          onWallColorChange={setWallColor}
        />

        <EditorCanvas
          maze={maze}
          selectedTool={selectedTool}
          onTilePaint={handleTilePaint}
          onPaintStart={handlePaintStart}
          wallColor={wallColor}
        />

        <LevelBrowser
          levels={levels}
          currentLevelId={currentLevelId}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onPlayTest={(level) => onPlayTest(level.maze, wallColor)}
        />
      </div>
    </div>
  );
}
