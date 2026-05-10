import { useState } from 'react';
import type { CustomLevel } from '../../engine/types';
import { loadLevels } from '../../utils/levelStorage';
import MazePreview from '../shared/MazePreview/MazePreview';
import styles from './LevelSelect.module.scss';

interface LevelSelectProps {
  onBack: () => void;
  onPlayLevel: (maze: number[][]) => void;
}

export default function LevelSelect({ onBack, onPlayLevel }: LevelSelectProps) {
  const [levels] = useState<CustomLevel[]>(() => loadLevels());

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>← BACK</button>
        <h2 className={styles.title}>CUSTOM LEVELS</h2>
        <div />
      </div>

      {levels.length === 0 ? (
        <div className={styles.empty}>
          <p>No custom levels found.</p>
          <p className={styles.hint}>Use the Level Editor to create your own!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {levels.map(level => (
            <button
              key={level.id}
              className={styles.levelCard}
              onClick={() => onPlayLevel(level.maze)}
            >
              {/* Mini preview */}
              <MazePreview
                maze={level.maze}
                rows={16}
                cols={14}
                className={styles.preview}
              />

              <div className={styles.cardName}>{level.name}</div>
              <div className={styles.cardDate}>
                {new Date(level.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
