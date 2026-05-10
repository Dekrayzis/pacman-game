import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GHOST_COLORS } from '../../engine/constants';
import { GhostName } from '../../engine/types';
import { drawGhostBody, drawGhostEyes } from '../../engine/ghostRenderer';
import styles from './StartScreen.module.scss';

const GHOST_NAMES = [GhostName.BLINKY, GhostName.PINKY, GhostName.INKY, GhostName.CLYDE];

// ─── GhostIcon (uses shared ghostRenderer instead of duplicating) ────

function GhostIcon({ color, mousePos }: { color: string; mousePos: { x: number; y: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 40, 40);
    ctx.save();
    ctx.translate(20, 20);

    // Body (shared function)
    drawGhostBody(ctx, color, 28);

    // Calculate pupil offset from mouse position
    let pupilOffsetX = 0;
    let pupilOffsetY = 0;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const maxOffset = 3;
      const clamp = Math.min(maxOffset, dist / 30);
      pupilOffsetX = (dx / dist) * clamp;
      pupilOffsetY = (dy / dist) * clamp;
    }

    // Eyes (shared function)
    drawGhostEyes(ctx, pupilOffsetX, pupilOffsetY);

    ctx.restore();
  }, [color, mousePos]);

  useEffect(() => {
    draw();
  }, [draw]);

  return <canvas ref={canvasRef} width={40} height={40} className={styles.ghostCanvas} />;
}

// ─── Menu key action lookup (object literal replaces switch) ─────────

const KEY_TO_MENU_ACTION: Record<string, 'up' | 'down' | 'select'> = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  Enter: 'select',
};

// ─── StartScreen ─────────────────────────────────────────────────────

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
  onEditor: () => void;
  onSelectLevel: () => void;
  hasCustomLevels: boolean;
}

export default function StartScreen({
  highScore,
  onStart,
  onEditor,
  onSelectLevel,
  hasCustomLevels,
}: StartScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Build menu items dynamically based on available options
  const menuItems = useMemo(() => {
    const items: { id: string; label: string; action: () => void; primary?: boolean }[] = [
      { id: 'start-game-btn', label: '▸ PLAY CLASSIC', action: onStart, primary: true },
    ];
    if (hasCustomLevels) {
      items.push({ id: 'custom-levels-btn', label: '▸ CUSTOM LEVELS', action: onSelectLevel });
    }
    items.push({ id: 'level-editor-btn', label: '▸ LEVEL EDITOR', action: onEditor });
    return items;
  }, [onStart, onEditor, onSelectLevel, hasCustomLevels]);

  const bgDotStyles = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
    })),
  []);

  // Focus the first button once content is visible
  useEffect(() => {
    if (showContent) {
      buttonRefs.current[0]?.focus();
    }
  }, [showContent]);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);

    const handleKey = (e: KeyboardEvent) => {
      const action = KEY_TO_MENU_ACTION[e.key];
      if (!action) return;

      e.preventDefault();
      const currentIndex = buttonRefs.current.findIndex(
        (btn) => btn === document.activeElement
      );

      const MENU_ACTIONS: Record<string, () => void> = {
        up: () => {
          const prev = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
          buttonRefs.current[prev]?.focus();
        },
        down: () => {
          const next = currentIndex >= menuItems.length - 1 ? 0 : currentIndex + 1;
          buttonRefs.current[next]?.focus();
        },
        select: () => {
          if (currentIndex >= 0) {
            menuItems[currentIndex].action();
          } else {
            menuItems[0].action();
          }
        },
      };

      MENU_ACTIONS[action]();
    };
    window.addEventListener('keydown', handleKey);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onStart, menuItems]);

  return (
    <div className={styles.container}>
      {/* Background dots animation */}
      <div className={styles.bgDots}>
        {bgDotStyles.map((dotStyle, i) => (
          <div
            key={i}
            className={styles.bgDot}
            style={dotStyle}
          />
        ))}
      </div>

      <div className={`${styles.content} ${showContent ? styles.visible : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.pacmanIcon}><span className={styles.eye} /></div>
          <h1 className={styles.title}>PAC-MAN</h1>
          <div className={styles.subtitle}>CLASSIC ARCADE</div>
        </div>

        {/* Ghost parade */}
        <div className={styles.ghostParade}>
          {GHOST_NAMES.map(name => (
            <div key={name} className={styles.ghost}>
              <GhostIcon color={GHOST_COLORS[name]} mousePos={mousePos} />
            </div>
          ))}
        </div>

        {/* High Score */}
        {highScore > 0 && (
          <div className={styles.highScore}>
            HIGH SCORE: <span>{highScore.toLocaleString()}</span>
          </div>
        )}

        {/* Buttons */}
        <div className={styles.buttons}>
          {menuItems.map((item, i) => (
            <button
              key={item.id}
              id={item.id}
              ref={(el) => { buttonRefs.current[i] = el; }}
              className={item.primary ? styles.startButton : styles.menuButton}
              onClick={item.action}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Prompt */}
        <div className={styles.prompt}>
          ↑↓ SELECT · ENTER TO START
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <span className={styles.keys}>↑ ↓ ← →</span>
            <span>or</span>
            <span className={styles.keys}>W A S D</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        © {new Date().getFullYear()} · BUILT WITH REACT
      </div>
    </div>
  );
}
