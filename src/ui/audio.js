/** Synthesised sound effects and spoken text. Both can be switched off in settings. */
let ctx = null;
const prefs = { sound: true, voice: true };

export function setAudioPrefs({ sound, voice }) {
  prefs.sound = sound !== false;
  prefs.voice = voice !== false;
  if (!prefs.voice) globalThis.speechSynthesis?.cancel();
}

function tone(freq, duration = 0.12, type = "sine", gain = 0.08, delay = 0) {
  if (!prefs.sound) return;
  try {
    ctx ||= new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch {
    /* audio not available */
  }
}

export const sfx = {
  tap: () => tone(520, 0.06, "triangle", 0.05),
  correct: () => [660, 880, 1100].forEach((f, i) => tone(f, 0.14, "triangle", 0.07, i * 0.08)),
  wrong: () => tone(260, 0.18, "sine", 0.05),
  place: () => tone(440, 0.1, "triangle", 0.06),
  merge: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, "square", 0.04, i * 0.06)),
  pop: () => tone(900 + Math.random() * 200, 0.05, "sine", 0.03),
  leak: () => tone(180, 0.25, "sawtooth", 0.04),
  beam: () => [300, 600, 1200].forEach((f, i) => tone(f, 0.2, "sawtooth", 0.04, i * 0.05)),
  win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.18, "triangle", 0.07, i * 0.1)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.22, "sine", 0.06, i * 0.15)),
  wave: () => [392, 523].forEach((f, i) => tone(f, 0.15, "triangle", 0.06, i * 0.1)),
};

/** Read text aloud with the browser's built-in voice. */
export function speak(text) {
  const synth = globalThis.speechSynthesis;
  if (!prefs.voice || !synth || !text) return;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replaceAll("−", " minus ").replaceAll("×", " times "));
    u.rate = 0.92;
    u.pitch = 1.1;
    u.lang = "en-GB";
    synth.speak(u);
  } catch {
    /* speech not available */
  }
}
