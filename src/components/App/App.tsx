import { useState, useCallback } from 'react';
import { cloneMaze } from '../../engine/maze';
import { loadHighScore, loadLevels } from '../../utils/levelStorage';
import { initAudio } from '../../engine/audio';
import { getTotalCampaignLevels } from '../../engine/levels';
import StartScreen from '../StartScreen/StartScreen';
import GameCanvas from '../GameCanvas/GameCanvas';
import HUD from '../HUD/HUD';
import GameOverScreen from '../GameOverScreen/GameOverScreen';
import LevelEditor from '../LevelEditor/LevelEditor';
import LevelSelect from './LevelSelect';
import styles from './App.module.scss';

type AppScreen = 'start' | 'playing' | 'gameover' | 'editor' | 'levelselect';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => loadHighScore());
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [wallColor, setWallColor] = useState('#2121DE');
  const [hasCustomLevels, setHasCustomLevels] = useState(() => loadLevels().length > 0);

  // Whether we're in campaign mode (5 levels) or playing a custom maze
  const [campaignMode, setCampaignMode] = useState(true);
  const [customMaze, setCustomMaze] = useState<number[][] | undefined>(undefined);

  // Start campaign mode (5 built-in levels)
  const handleStart = useCallback(() => {
    initAudio();
    setCampaignMode(true);
    setCustomMaze(undefined);
    setWallColor('#2121DE');
    setScore(0);
    setLives(3);
    setLevel(1);
    setIsNewHighScore(false);
    setScreen('playing');
  }, []);

  // Start a custom maze (from editor or level select)
  const handlePlayCustom = useCallback((maze: number[][], color?: string) => {
    initAudio();
    setCampaignMode(false);
    setCustomMaze(cloneMaze(maze));
    setWallColor(color || '#2121DE');
    setScore(0);
    setLives(3);
    setLevel(1);
    setIsNewHighScore(false);
    setScreen('playing');
  }, []);

  const handleGameOver = useCallback((finalScore: number, newHighScore: number) => {
    setScore(finalScore);
    setHighScore(newHighScore);
    setIsNewHighScore(finalScore >= newHighScore && finalScore > 0);
    setScreen('gameover');
  }, []);

  const handleScoreChange = useCallback((newScore: number, newHighScore: number, newLives: number, newLevel: number) => {
    setScore(newScore);
    setHighScore(newHighScore);
    setLives(newLives);
    setLevel(newLevel);
  }, []);

  const handleMenu = useCallback(() => {
    setHighScore(loadHighScore());
    setHasCustomLevels(loadLevels().length > 0);
    setScreen('start');
  }, []);

  const totalLevels = getTotalCampaignLevels();

  return (
    <div className={`${styles.app} crt-effect`} id="pacman-app">
      {screen === 'start' && (
        <StartScreen
          highScore={highScore}
          onStart={handleStart}
          onEditor={() => setScreen('editor')}
          onSelectLevel={() => setScreen('levelselect')}
          hasCustomLevels={hasCustomLevels}
        />
      )}

      {screen === 'playing' && (
        <div className={styles.gameScreen}>
          <HUD
            score={score}
            highScore={highScore}
            lives={lives}
            level={level}
            totalLevels={campaignMode ? totalLevels : undefined}
          />
          <GameCanvas
            maze={customMaze}
            onGameOver={handleGameOver}
            onScoreChange={handleScoreChange}
            wallColor={wallColor}
            campaignMode={campaignMode}
          />
        </div>
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onRestart={handleStart}
          onMenu={handleMenu}
        />
      )}

      {screen === 'editor' && (
        <LevelEditor
          onBack={handleMenu}
          onPlayTest={handlePlayCustom}
        />
      )}

      {screen === 'levelselect' && (
        <LevelSelect
          onBack={handleMenu}
          onPlayLevel={(maze) => handlePlayCustom(maze)}
        />
      )}
    </div>
  );
}
