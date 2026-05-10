<p align="center">
  <img src="src/assets/hero.png" alt="PAC-MAN — Classic Arcade" width="480" />
</p>

<h1 align="center">🟡 PAC-MAN — Classic Arcade</h1>

<p align="center">
  A faithful recreation of the iconic arcade game, built from scratch with <strong>React</strong>, <strong>TypeScript</strong> and the <strong>HTML Canvas API</strong>.<br/>
  Features authentic ghost AI, multiple maze campaigns, a built-in level editor, and synthesised retro audio.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Sass-SCSS_Modules-CC6699?logo=sass&logoColor=white" alt="Sass" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| **Classic Gameplay** | Dots, power pellets, fruit bonuses, extra lives at 10 000 pts, and escalating difficulty across levels |
| **Authentic Ghost AI** | Each ghost (Blinky, Pinky, Inky, Clyde) uses its own chase strategy, plus scatter, frightened and eaten modes |
| **5-Level Campaign** | _Classic → The Grid → The Chambers → The Gauntlet → The Fortress_ — each with unique mazes, wall colours, faster ghosts and shorter power-pellet durations |
| **Level Editor** | Paint walls, dots, pellets and ghost houses on a 28×31 grid · Undo/Redo · Save/load custom levels to `localStorage` |
| **Custom Level Browser** | Play, rename or delete your creations from a dedicated level select screen |
| **Retro Sound FX** | All audio synthesised at runtime via the **Web Audio API** — no external sound files |
| **Keyboard Controls** | Arrow keys **or** WASD, plus keyboard-navigable menus |
| **Responsive Canvas** | 2× scaled pixel art rendered to a sharp `<canvas>` element |

---

## 🎮 Controls

| Action | Keys |
|---|---|
| Move | `↑` `↓` `←` `→` **or** `W` `A` `S` `D` |
| Navigate menus | `↑` `↓` to select · `Enter` to confirm |
| Pause _(in-game)_ | `Esc` |

---

## 👻 Ghost AI

The four ghosts follow the original arcade targeting rules:

| Ghost | Colour | Chase Strategy |
|---|---|---|
| **Blinky** | Red | Targets Pac-Man's current tile directly |
| **Pinky** | Pink | Targets 4 tiles ahead of Pac-Man |
| **Inky** | Cyan | Uses Blinky's position to calculate a reflected target 2 tiles ahead of Pac-Man |
| **Clyde** | Orange | Chases Pac-Man when far away (> 8 tiles), retreats to scatter corner when close |

Ghosts cycle through **Scatter → Chase** waves on a timer, reverse direction on mode transitions, and enter **Frightened** mode when Pac-Man eats a power pellet.

---

## 🏗️ Project Structure

```
src/
├── engine/              # Pure game logic (no React)
│   ├── types.ts         # All type definitions & enums
│   ├── constants.ts     # Grid, speed, timing & scoring config
│   ├── maze.ts          # Maze utilities & classic maze data
│   ├── mazeRenderer.ts  # Canvas maze drawing
│   ├── pacman.ts        # Pac-Man movement & animation
│   ├── ghost.ts         # Ghost AI, targeting & movement
│   ├── ghostRenderer.ts # Canvas ghost drawing
│   ├── collision.ts     # Pac-Man / ghost / dot collision handling
│   ├── levels.ts        # Campaign level configs & maze data
│   ├── updateGame.ts    # Main game-state update loop
│   ├── renderGame.ts    # Top-level render orchestrator
│   └── audio.ts         # Web Audio synthesiser
├── components/
│   ├── App/             # Root component & game state machine
│   ├── GameCanvas/      # Canvas wrapper & game loop hook
│   ├── HUD/             # Score, lives & level display
│   ├── StartScreen/     # Animated title screen with ghost parade
│   ├── GameOverScreen/  # Game over overlay
│   ├── LevelEditor/     # Editor canvas, tool palette & level browser
│   └── shared/          # Reusable UI primitives
├── hooks/
│   ├── useGameLoop.ts   # requestAnimationFrame loop
│   ├── useKeyboardInput.ts
│   ├── useToastMessage.ts
│   └── useUndoRedo.ts   # Editor undo/redo stack
├── utils/
│   └── levelStorage.ts  # localStorage CRUD for custom levels
└── styles/
    ├── global.scss
    ├── _variables.scss
    ├── _mixins.scss
    └── _animations.scss
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18+**
- npm (bundled with Node)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/Dekrayzis/pacman-game.git
cd pacman-game

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## 🛠️ Tech Stack

- **React 19** — UI components & state management
- **TypeScript 6** — type-safe game engine & components
- **Vite 8** — blazing-fast dev server & bundler
- **Sass (SCSS Modules)** — scoped, modular styling with shared variables & mixins
- **HTML Canvas API** — pixel-perfect 2D rendering at 60 fps
- **Web Audio API** — runtime-synthesised retro sound effects

---

## 📝 License

This project is released under the [MIT License](LICENSE).

---

<p align="center">
  <em>Waka waka waka waka 🟡</em>
</p>
