import { useEffect, useState } from 'react';
import styles from './GameOverScreen.module.scss';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({
  score,
  highScore,
  isNewHighScore,
  onRestart,
  onMenu,
}: GameOverScreenProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onRestart();
      if (e.key === 'Escape') onMenu();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onRestart, onMenu]);

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${show ? styles.visible : ''}`}>
        <h1 className={styles.gameOverText}>GAME OVER</h1>

        {isNewHighScore && (
          <div className={styles.newHighScore}>
            ★ NEW HIGH SCORE! ★
          </div>
        )}

        <div className={styles.stats}>
          {[
            { label: 'FINAL SCORE', value: score.toLocaleString(), className: styles.statValue },
            { label: 'HIGH SCORE', value: highScore.toLocaleString(), className: styles.statHighScore },
          ].map(({ label, value, className }) => (
            <div key={label} className={styles.statRow}>
              <span className={styles.statLabel}>{label}</span>
              <span className={className}>{value}</span>
            </div>
          ))}
        </div>

        <div className={styles.buttons}>
          {[
            { id: 'restart-btn', label: '▸ PLAY AGAIN', className: styles.restartButton, onClick: onRestart },
            { id: 'menu-btn', label: '▸ MAIN MENU', className: styles.menuButton, onClick: onMenu },
          ].map(({ id, label, className, onClick }) => (
            <button key={id} id={id} className={className} onClick={onClick}>
              {label}
            </button>
          ))}
        </div>

        <div className={styles.prompt}>
          ENTER TO RESTART · ESC FOR MENU
        </div>
      </div>

      {/* Decorative dead Pacman */}
      <div className={styles.deadPacman}>ᗧ</div>
    </div>
  );
}
