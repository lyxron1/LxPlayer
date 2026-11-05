// LxPlayer Web Audio Engine - Pure synthesized UI sound effects
// No external MP3/WAV files required

let audioCtx = null;
let lastHoverTime = 0;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled() {
  const saved = localStorage.getItem('lx_sound_enabled');
  return saved === null ? true : saved === 'true';
}

export function setSoundEnabled(enabled) {
  localStorage.setItem('lx_sound_enabled', enabled ? 'true' : 'false');
}

/**
 * Cinematic Startup "Ta-Dum" Sound
 * Synthesizes a deep resonant cinematic sub-bass strike (55Hz -> 110Hz sweep + harmonic punch)
 */
export function playStartupSound() {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Sub-bass boom
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    subOsc.type = 'sine';
    // Frequency sweep from 55Hz to 110Hz and gentle taper
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.85);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.Q.setValueAtTime(4, now);

    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.45, now + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    subOsc.connect(filter);
    filter.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.95);

    // 2. Mid harmonic impact ("Ta")
    const midOsc = ctx.createOscillator();
    const midGain = ctx.createGain();

    midOsc.type = 'triangle';
    midOsc.frequency.setValueAtTime(140, now);
    midOsc.frequency.exponentialRampToValueAtTime(75, now + 0.25);

    midGain.gain.setValueAtTime(0.0001, now);
    midGain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    midGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    midOsc.connect(midGain);
    midGain.connect(ctx.destination);

    midOsc.start(now);
    midOsc.stop(now + 0.4);

    // 3. Second cinematic accent strike ("Dum")
    const delayDum = 0.22;
    const dumOsc = ctx.createOscillator();
    const dumGain = ctx.createGain();

    dumOsc.type = 'sine';
    dumOsc.frequency.setValueAtTime(65, now + delayDum);
    dumOsc.frequency.exponentialRampToValueAtTime(95, now + delayDum + 0.15);
    dumOsc.frequency.exponentialRampToValueAtTime(38, now + delayDum + 0.8);

    dumGain.gain.setValueAtTime(0.0001, now + delayDum);
    dumGain.gain.linearRampToValueAtTime(0.35, now + delayDum + 0.03);
    dumGain.gain.exponentialRampToValueAtTime(0.0001, now + delayDum + 0.85);

    dumOsc.connect(dumGain);
    dumGain.connect(ctx.destination);

    dumOsc.start(now + delayDum);
    dumOsc.stop(now + delayDum + 0.9);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Navigation / Hover Sound ("Tick / Blip")
 * Light 850Hz, 12ms micro-pop with smooth exponential envelope (Apple TV / Console feel)
 */
export function playHoverSound() {
  if (!isSoundEnabled()) return;

  const nowMs = performance.now();
  // Prevent audio spamming when sliding quickly over many elements (min 45ms gap)
  if (nowMs - lastHoverTime < 45) return;
  lastHoverTime = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.012);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.016);
  } catch (err) {
    // Ignore audio context errors
  }
}

/**
 * Click Sound
 * Punchy crisp click (~520Hz down to 200Hz over 35ms)
 */
export function playClickSound() {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (err) {
    // Ignore audio context errors
  }
}
