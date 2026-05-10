import { TileType } from '../../engine/types';
import { TILE_COLORS, WALL_PRESETS } from '../../engine/constants';
import styles from './ToolPalette.module.scss';

interface ToolPaletteProps {
  selectedTool: TileType;
  onSelectTool: (tool: TileType) => void;
  onClear: () => void;
  onLoadClassic: () => void;
  onExport: () => void;
  onImport: () => void;
  wallColor: string;
  onWallColorChange: (color: string) => void;
}

const TOOLS: { type: TileType; label: string; key: string; icon: string }[] = [
  { type: TileType.WALL, label: 'Wall', key: '1', icon: '▮' },
  { type: TileType.DOT, label: 'Dot', key: '2', icon: '·' },
  { type: TileType.POWER_PELLET, label: 'Power Pellet', key: '3', icon: '●' },
  { type: TileType.EMPTY, label: 'Empty', key: '4', icon: '□' },
  { type: TileType.GHOST_HOUSE, label: 'Ghost House', key: '5', icon: '⌂' },
  { type: TileType.GHOST_DOOR, label: 'Ghost Door', key: '6', icon: '▬' },
  { type: TileType.PACMAN_SPAWN, label: 'Pacman Spawn', key: '7', icon: 'ᗧ' },
];

const ACTIONS: { id: string; label: string; onClick: string }[] = [
  { id: 'clear-maze-btn', label: '🗑 Clear All', onClick: 'onClear' },
  { id: 'load-classic-btn', label: '🎮 Load Classic', onClick: 'onLoadClassic' },
  { id: 'export-btn', label: '📋 Export', onClick: 'onExport' },
  { id: 'import-btn', label: '📥 Import', onClick: 'onImport' },
];

const HELP_ITEMS = [
  'Click to paint',
  'Drag to draw',
  'Ctrl+Z Undo',
  'Ctrl+Y Redo',
  'Ctrl+S Save',
];

function getToolColor(type: TileType, wallColor: string): string {
  return type === TileType.WALL ? wallColor : (TILE_COLORS[type] ?? '#333333');
}

export default function ToolPalette({
  selectedTool,
  onSelectTool,
  onClear,
  onLoadClassic,
  onExport,
  onImport,
  wallColor,
  onWallColorChange,
}: ToolPaletteProps) {
  const actionHandlers: Record<string, () => void> = {
    onClear, onLoadClassic, onExport, onImport,
  };

  return (
    <div className={styles.palette}>
      <div className={styles.sectionTitle}>TILES</div>
      <div className={styles.tools}>
        {TOOLS.map(tool => (
          <button
            key={tool.type}
            className={`${styles.tool} ${selectedTool === tool.type ? styles.active : ''}`}
            onClick={() => onSelectTool(tool.type)}
            title={`${tool.label} (${tool.key})`}
            style={{ '--tool-color': getToolColor(tool.type, wallColor) } as React.CSSProperties}
            id={`tool-${tool.type}`}
          >
            <span className={styles.toolIcon}>{tool.icon}</span>
            <span className={styles.toolLabel}>{tool.label}</span>
            <span className={styles.toolKey}>{tool.key}</span>
          </button>
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.sectionTitle}>WALL COLOR</div>
      <div className={styles.colorSwatches}>
        {WALL_PRESETS.map(preset => (
          <button
            key={preset.color}
            className={`${styles.swatch} ${wallColor === preset.color ? styles.activeSwatch : ''}`}
            style={{ backgroundColor: preset.color }}
            onClick={() => onWallColorChange(preset.color)}
            title={preset.label}
          />
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.sectionTitle}>ACTIONS</div>
      <div className={styles.actions}>
        {ACTIONS.map(({ id, label, onClick }) => (
          <button key={id} className={styles.actionBtn} onClick={actionHandlers[onClick]} id={id}>
            {label}
          </button>
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.help}>
        {HELP_ITEMS.map(item => (
          <div key={item} className={styles.helpItem}>{item}</div>
        ))}
      </div>
    </div>
  );
}
