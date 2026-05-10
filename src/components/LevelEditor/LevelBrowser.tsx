import type { CustomLevel } from '../../engine/types';
import MazePreview from '../shared/MazePreview/MazePreview';
import styles from './LevelBrowser.module.scss';

interface LevelBrowserProps {
  levels: CustomLevel[];
  currentLevelId: string | null;
  onLoad: (level: CustomLevel) => void;
  onDelete: (id: string) => void;
  onPlayTest: (level: CustomLevel) => void;
}

export default function LevelBrowser({
  levels,
  currentLevelId,
  onLoad,
  onDelete,
  onPlayTest,
}: LevelBrowserProps) {
  return (
    <div className={styles.browser}>
      <div className={styles.sectionTitle}>SAVED LEVELS</div>

      {levels.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📁</div>
          <div className={styles.emptyText}>No saved levels yet</div>
          <div className={styles.emptyHint}>Create and save a level to see it here</div>
        </div>
      ) : (
        <div className={styles.levelList}>
          {levels.map(level => (
            <div
              key={level.id}
              className={`${styles.levelCard} ${currentLevelId === level.id ? styles.active : ''}`}
            >
              <div className={styles.levelInfo}>
                <div className={styles.levelName}>{level.name}</div>
                <div className={styles.levelDate}>
                  {new Date(level.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Mini maze preview */}
              <MazePreview
                maze={level.maze}
                rows={15}
                cols={14}
                className={styles.miniPreview}
              />

              <div className={styles.levelActions}>
                <button
                  className={styles.loadBtn}
                  onClick={() => onLoad(level)}
                  title="Load in editor"
                >
                  ✎
                </button>
                <button
                  className={styles.playBtn}
                  onClick={() => onPlayTest(level)}
                  title="Play test"
                >
                  ▶
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => onDelete(level.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
