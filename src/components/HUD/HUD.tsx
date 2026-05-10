import styles from './HUD.module.scss';

interface HUDProps {
  score: number;
  highScore: number;
  lives: number;
  level: number;
  totalLevels?: number;
}

export default function HUD({ score, highScore, lives, level, totalLevels }: HUDProps) {
  const levelDisplay = totalLevels ? `${level} / ${totalLevels}` : level;

  return (
    <div className={styles.hud} id="game-hud">
      {[
        { label: 'SCORE', value: score.toLocaleString(), className: styles.value },
        { label: 'HIGH SCORE', value: highScore.toLocaleString(), className: styles.highScoreValue },
        { label: 'LEVEL', value: levelDisplay, className: styles.levelValue },
      ].map(({ label, value, className }) => (
        <div key={label} className={styles.section}>
          <div className={styles.label}>{label}</div>
          <div className={className}>{value}</div>
        </div>
      ))}

      <div className={styles.section}>
        <div className={styles.label}>LIVES</div>
        <div className={styles.lives}>
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i} className={styles.lifeIcon}>ᗧ</span>
          ))}
        </div>
      </div>
    </div>
  );
}
