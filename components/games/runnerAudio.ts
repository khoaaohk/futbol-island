import { isSoundEnabled, getSoundVolume } from "../../lib/games/sound";

/** Small, synthesized arcade cues; audio is unlocked only by a player gesture. */
export function createRunnerAudio() {
  let context: AudioContext | null = null;
  let muted = false;
  const unlock = () => {
    if (!isSoundEnabled() || muted) return;
    try { context ??= new AudioContext(); void context.resume().catch(() => {}); } catch { /* Audio is optional. */ }
  };
  const tone = (frequencies: number[], duration = 0.09, type: OscillatorType = "sine") => {
    if (!context || muted || getSoundVolume() <= 0 || !isSoundEnabled() || context.state !== "running") return;
    const start = context.currentTime;
    frequencies.forEach((frequency, i) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      const at = start + i * duration;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(Math.max(0.001, 0.045 * getSoundVolume()), at + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
      oscillator.connect(gain); gain.connect(context!.destination);
      oscillator.start(at); oscillator.stop(at + duration + 0.02);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  };
  return {
    unlock,
    mute(value: boolean) { muted = value; if (!value) unlock(); },
    jump() { tone([240, 360], 0.055); },
    collect() { tone([740, 980], 0.045); },
    boost() { tone([180, 280, 440, 660], 0.065, "triangle"); },
    goal() { tone([523, 659, 784, 1047], 0.1, "triangle"); },
    hit() { tone([130, 80], 0.12, "triangle"); },
    dispose() { if (context) void context.close().catch(() => {}); context = null; },
  };
}
