/**
 * Lightweight WebAudio SFX placeholders — no external assets.
 *
 * Each cue is a synthesized blip so the gameplay loop gets satisfying audio
 * feedback today; swap for sampled mp3/wav files later by replacing `play()`.
 *
 *   sfx.play("correct")
 *
 * Sounds respect `settings.soundOn` via `setSoundEnabled(bool)`.
 */
import { services } from "@/services";

type Cue = "tick" | "tickUrgent" | "reveal" | "correct" | "wrong" | "win" | "lose" | "levelUp" | "tap";

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      ctx = new AC();
    } catch { return null; }
  }
  // Resume from suspended (iOS gesture lock)
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function blip(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.08, slideTo?: number) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const cues: Record<Cue, () => void> = {
  tap:        () => blip(420, 0.05, "triangle", 0.04),
  tick:       () => blip(880, 0.04, "square", 0.025),
  tickUrgent: () => blip(1320, 0.06, "square", 0.05),
  reveal:     () => { blip(520, 0.08, "triangle", 0.05, 780); },
  correct:    () => { blip(660, 0.1, "triangle", 0.08, 990); setTimeout(() => blip(990, 0.14, "triangle", 0.08, 1480), 90); },
  wrong:      () => { blip(220, 0.18, "sawtooth", 0.07, 140); },
  win:        () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.18, "triangle", 0.09), i * 90));
  },
  lose:       () => { blip(330, 0.25, "sawtooth", 0.07, 180); setTimeout(() => blip(196, 0.35, "sawtooth", 0.07, 120), 180); },
  levelUp:    () => {
    [659, 880, 1175, 1397].forEach((f, i) => setTimeout(() => blip(f, 0.16, "sine", 0.1), i * 80));
  },
};

export const sfx = {
  play(cue: Cue) {
    if (!enabled) return;
    try { cues[cue](); } catch { /* ignore */ }
  },
  setEnabled(v: boolean) { enabled = v; },
};

// Sync with settings on load.
if (typeof window !== "undefined") {
  try { enabled = services.settings.get().soundOn; } catch { /* services may not be ready in SSR */ }
}
