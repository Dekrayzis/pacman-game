// ─── Web Audio API Sound System ──────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume: number = 0.1
): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

// ─── Sound handlers (object literal replaces switch) ─────────────────

let chompToggle = false;

const SOUND_HANDLERS: Record<string, () => void> = {
  chomp: () => {
    chompToggle = !chompToggle;
    playTone(chompToggle ? 261 : 293, 0.08, 'square', 0.06);
  },

  power: () => {
    playTone(130, 0.3, 'sawtooth', 0.08);
    setTimeout(() => playTone(165, 0.3, 'sawtooth', 0.08), 150);
  },

  ghost_eat: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(400 + i * 200, 0.08, 'square', 0.08), i * 40);
    }
  },

  death: () => {
    for (let i = 0; i < 12; i++) {
      setTimeout(() => playTone(600 - i * 40, 0.12, 'triangle', 0.08), i * 80);
    }
  },

  fruit: () => {
    playTone(523, 0.1, 'square', 0.08);
    setTimeout(() => playTone(659, 0.1, 'square', 0.08), 80);
    setTimeout(() => playTone(784, 0.2, 'square', 0.08), 160);
  },

  extra_life: () => {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => playTone(440 + i * 110, 0.15, 'triangle', 0.1), i * 120);
    }
  },

  intro: () => {
    const notes = [523, 587, 659, 523, 659, 523, 659, 698, 784];
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.15, 'square', 0.06), i * 130);
    });
  },

  level_complete: () => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => playTone(400 + i * 100, 0.1, 'triangle', 0.08), i * 100);
    }
  },
};

export function playSound(sound: string): void {
  SOUND_HANDLERS[sound]?.();
}

export function initAudio(): void {
  getAudioContext();
}
