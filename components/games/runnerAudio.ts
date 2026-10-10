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

/* ------------------------------------------------------------------------ *
 * Breakaway Run soundtrack (live three.js arcade runner).
 * Everything is synthesized on the arcade's existing, gesture-unlocked
 * AudioContext. No timers, no looping sources, no persistent oscillators:
 * notes are scheduled ~120 ms ahead from the game's own frame update, so the
 * music simply stops when the game is paused, hidden or finished.
 * ------------------------------------------------------------------------ */
type SoundtrackState = {
  lives: number; level: number; lane: number; speed: number; boost: number; combo: number; charging: boolean;
  jumps: number; slides: number; landings: number; cuts: number; cutDir: number; nearMisses: number; hits: number;
  event: number; eventKind: string; lastBlast: number; lastVolley: boolean; collected: number; goals: number;
  objects: ReadonlyArray<{ kind: string; z: number; passed: boolean; scored?: boolean }>;
};
const BASS = [65.41, 49, 55, 43.65]; // C G A F (I V vi IV), kid-bright and loopable
const CHORDS = [[261.63, 329.63, 392], [246.94, 293.66, 392], [261.63, 329.63, 440], [261.63, 349.23, 440]];
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
const VOICE_CAP = 28;

function readMusicPrefs() {
  let enabled = true, volume = 0.04;
  try {
    enabled = localStorage.getItem("fi2-music-enabled") !== "false";
    const raw = localStorage.getItem("fi2-music-volume"), value = raw === null ? 0.04 : Number(raw);
    volume = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.04;
  } catch { /* storage may be blocked */ }
  return { enabled, volume };
}

export function createRunnerSoundtrack(getContext: () => AudioContext | null) {
  let ctx: AudioContext | null = null, sfx: GainNode | null = null, music: GainNode | null = null, noise: AudioBuffer | null = null;
  let voices = 0, nextStep = 0, step = 0, prefClock = 99, soundOn = true, sfxVolume = 0.5, musicOn = true, musicVolume = 0.04;
  let hype = 0, seen: SoundtrackState | null = null;
  const last = { jumps: 0, slides: 0, landings: 0, cuts: 0, nearMisses: 0, event: 0, collected: 0, level: 1, multiplier: 1 };
  let seed = 90127;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const jitter = (amount: number) => 1 + (rand() * 2 - 1) * amount;

  function ensure() {
    const context = getContext();
    if (!context || context.state !== "running") return null;
    if (context !== ctx) {
      ctx = context; voices = 0; nextStep = 0;
      sfx = context.createGain(); sfx.connect(context.destination);
      music = context.createGain(); music.connect(context.destination);
      noise = context.createBuffer(1, Math.ceil(context.sampleRate * 2.6), context.sampleRate);
      const data = noise.getChannelData(0); let n = 4127;
      for (let i = 0; i < data.length; i++) { n = (n * 1664525 + 1013904223) >>> 0; data[i] = n / 2147483648 - 1; }
      prefClock = 99; refreshPrefs(0);
    }
    return ctx;
  }
  function refreshPrefs(dt: number) {
    prefClock += dt; if (prefClock < 1) return; prefClock = 0;
    soundOn = isSoundEnabled(); sfxVolume = getSoundVolume();
    const prefs = readMusicPrefs(); musicOn = prefs.enabled; musicVolume = prefs.volume;
    if (sfx) sfx.gain.value = soundOn ? sfxVolume : 0;
    if (music) music.gain.value = soundOn && musicOn ? Math.min(0.4, musicVolume * 2.2) : 0;
  }
  const release = (nodes: AudioNode[]) => () => { voices = Math.max(0, voices - 1); for (const node of nodes) node.disconnect(); };

  /** Pitched voice with an attack/decay envelope and optional glide. */
  function tone(bus: GainNode, at: number, hz: number, peak: number, duration: number, type: OscillatorType = "sine", glideTo = 0, pan = 0) {
    if (!ctx || voices >= VOICE_CAP || peak <= 0) return;
    const osc = ctx.createOscillator(), gain = ctx.createGain(), nodes: AudioNode[] = [osc, gain];
    osc.type = type; osc.frequency.setValueAtTime(hz, at);
    if (glideTo > 0) osc.frequency.exponentialRampToValueAtTime(glideTo, at + duration);
    gain.gain.setValueAtTime(0.0001, at); gain.gain.linearRampToValueAtTime(peak, at + 0.006); gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(gain);
    if (pan && typeof ctx.createStereoPanner === "function") { const p = ctx.createStereoPanner(); p.pan.value = pan; gain.connect(p); p.connect(bus); nodes.push(p); } else gain.connect(bus);
    voices++; osc.onended = release(nodes); osc.start(at); osc.stop(at + duration + 0.02);
  }
  /** Filtered noise: hats, whooshes, scrapes and crowd grains. */
  function hiss(bus: GainNode, at: number, duration: number, peak: number, type: BiquadFilterType, from: number, to = from, q = 0.8, attack = 0.005, pan = 0) {
    if (!ctx || !noise || voices >= VOICE_CAP || peak <= 0) return;
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain(), nodes: AudioNode[] = [src, filter, gain];
    src.buffer = noise; filter.type = type; filter.Q.value = q; filter.frequency.setValueAtTime(from, at);
    if (to !== from) filter.frequency.exponentialRampToValueAtTime(to, at + duration);
    gain.gain.setValueAtTime(0.0001, at); gain.gain.linearRampToValueAtTime(peak, at + attack); gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    src.connect(filter); filter.connect(gain);
    if (pan && typeof ctx.createStereoPanner === "function") { const p = ctx.createStereoPanner(); p.pan.value = pan; gain.connect(p); p.connect(bus); nodes.push(p); } else gain.connect(bus);
    voices++; src.onended = release(nodes);
    src.start(at, rand() * Math.max(0, noise.duration - duration - 0.06), duration + 0.05);
  }

  function playStep(s: SoundtrackState, at: number) {
    if (!music) return;
    const bar = Math.floor(step / 16) % 4, beat = step % 16, chord = CHORDS[bar], drive = Math.min(1, Math.max(0, (s.speed - 13) / 5));
    const level = s.level, boost = s.boost > 0;
    // Kick on the beat; a pickup kick from stage 2 drives the groove forward.
    if (beat % 4 === 0 || (level >= 2 && beat === 14)) tone(music, at, 118 * jitter(0.02), 0.5, 0.2, "sine", 42);
    // Bass: root on 1, octave push on the "and" of 2 and 4.
    if (beat === 0 || beat === 6 || beat === 10) tone(music, at, BASS[bar] * (beat === 6 ? 2 : 1), 0.26, 0.24, "triangle");
    // Off-beat hats grow with pace; boost doubles them.
    if (beat % 4 === 2 || (boost && beat % 2 === 1)) hiss(music, at, 0.045, (0.07 + drive * 0.06) * jitter(0.25), "highpass", 7200);
    // Clap on 2 and 4 from stage 3.
    if (level >= 3 && beat % 8 === 4) hiss(music, at, 0.13, 0.16 * jitter(0.15), "bandpass", 1500, 1100, 1.1);
    // Bright pentatonic pluck pattern from stage 2 (or during a power run).
    if ((level >= 2 || boost) && beat % 2 === 0) {
      const note = chord[(beat / 2 + bar) % 3] * (boost ? 2 : 1) * (beat % 8 === 6 ? 2 : 1);
      tone(music, at, note, 0.07 + drive * 0.03, 0.16, "triangle");
    }
    // A sparkle on bar starts once the run is properly flowing.
    if (beat === 0 && s.combo >= 6) tone(music, at + 0.01, PENTA[(step / 16 + s.combo) % PENTA.length | 0], 0.06, 0.4, "sine");
    // Crowd murmur: overlapping soft noise grains each beat; louder near a goal.
    if (beat % 4 === 0 && sfx) { const centre = 520 + rand() * 420; hiss(sfx, at, 0.9, (0.012 + hype * 0.05) * jitter(0.3), "bandpass", centre, centre, 0.7, 0.3, (rand() * 2 - 1) * 0.6); }
  }

  function whoosh(at: number, peak: number, duration: number, pan: number, high = 2800) { if (sfx) hiss(sfx, at, duration, peak, "bandpass", high * jitter(0.12), 420, 1.4, 0.03, pan); }
  function roar(at: number, peak: number, duration: number) { if (!sfx) return; hiss(sfx, at, duration, peak, "bandpass", 650, 900, 0.6, 0.18, -0.3); hiss(sfx, at + 0.05, duration, peak * 0.8, "bandpass", 1050, 1300, 0.7, 0.2, 0.3); }
  function whistle(at: number) {
    if (!ctx || !sfx) return;
    for (const [offset, length] of [[0, 0.16], [0.24, 0.16], [0.48, 0.62]]) {
      if (voices >= VOICE_CAP - 2) return;
      const osc = ctx.createOscillator(), lfo = ctx.createOscillator(), depth = ctx.createGain(), gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = 2650; lfo.frequency.value = 38; depth.gain.value = 140;
      lfo.connect(depth); depth.connect(osc.frequency); osc.connect(gain); gain.connect(sfx);
      const t = at + offset; gain.gain.setValueAtTime(0.0001, t); gain.gain.linearRampToValueAtTime(0.09, t + 0.015); gain.gain.setValueAtTime(0.09, t + length - 0.04); gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
      voices += 1; osc.onended = () => { voices = Math.max(0, voices - 1); lfo.disconnect(); depth.disconnect(); osc.disconnect(); gain.disconnect(); };
      osc.start(t); lfo.start(t); osc.stop(t + length + 0.02); lfo.stop(t + length + 0.02);
    }
  }

  function events(s: SoundtrackState, now: number) {
    if (!sfx) return;
    if (s.cuts !== last.cuts) { whoosh(now, 0.035 * jitter(0.2), 0.16, s.cutDir * 0.5, 2200); tone(sfx, now + 0.02, 150 * jitter(0.08), 0.05, 0.06, "triangle", 90); }
    if (s.jumps !== last.jumps) { tone(sfx, now, 260 * jitter(0.06), 0.06, 0.16, "sine", 520); whoosh(now, 0.025, 0.2, 0, 1800); }
    if (s.landings !== last.landings) tone(sfx, now, 110 * jitter(0.08), 0.08, 0.09, "sine", 60);
    if (s.slides !== last.slides) hiss(sfx, now, 0.38, 0.06, "lowpass", 1400, 380, 0.6, 0.02);
    if (s.nearMisses !== last.nearMisses) { whoosh(now, 0.11, 0.32, s.cutDir * 0.7, 3600); tone(sfx, now + 0.08, 784, 0.045, 0.12, "triangle"); tone(sfx, now + 0.15, 1175, 0.04, 0.16, "triangle"); }
    if (s.collected !== last.collected) {
      // Rising ladder while touches stay clean: a kind, musical streak cue.
      const rung = PENTA[Math.min(PENTA.length - 1, s.combo % PENTA.length)];
      tone(sfx, now, rung * jitter(0.01), 0.035, 0.14, "triangle");
    }
    // Clean-run multiplier up: a short rising arpeggio (reward, never a warning).
    const multiplier = Math.min(3, 1 + Math.floor(s.combo / 6));
    if (multiplier > last.multiplier) PENTA.slice(1, 4).forEach((hz, i) => tone(sfx!, now + i * 0.06, hz * multiplier / 2, 0.045, 0.18, "triangle"));
    // New stage: the crowd lifts.
    if (s.level > last.level) roar(now, 0.08, 1.4);
    if (s.event !== last.event) {
      const kind = s.eventKind;
      if (kind === "shot") { const blast = s.lastBlast >= 0.8; tone(sfx, now, (blast ? 120 : 175) * jitter(0.08), blast ? 0.2 : 0.12, blast ? 0.28 : 0.12, "sine", blast ? 38 : 70); hiss(sfx, now, 0.05, 0.09, "highpass", 2500); if (blast) whoosh(now + 0.02, 0.09, 0.4, 0, 1600); }
      else if (kind === "clear") tone(sfx, now, 95 * jitter(0.1), 0.12, 0.18, "triangle", 55);
      else if (kind === "goal") { roar(now + 0.03, 0.16, 2.1); hype = 1; }
      else if (kind === "save") hiss(sfx, now + 0.05, 0.9, 0.08, "bandpass", 900, 380, 1.2, 0.12); // crowd "ooh"
      else if (kind === "block") tone(sfx, now, 140 * jitter(0.06), 0.12, 0.12, "triangle", 80);
      else if (kind === "hit") {
        tone(sfx, now, 90 * jitter(0.06), 0.22, 0.26, "sine", 40); hiss(sfx, now, 0.12, 0.08, "lowpass", 900, 300);
        if (s.lives <= 0) { whistle(now + 0.25); hiss(sfx, now + 0.35, 1.3, 0.07, "bandpass", 700, 330, 0.9, 0.25); }
        else hiss(sfx, now + 0.08, 0.7, 0.05, "bandpass", 820, 420, 1.1, 0.1);
      }
      else if (kind === "skill") tone(sfx, now, 660 * jitter(0.03), 0.05, 0.1, "triangle", 990);
      // Round 2 depth cues: each new decision has its own short, synthesized voice.
      else if (kind === "skillmove") { whoosh(now, 0.08, 0.32, 0, 2400); tone(sfx, now + 0.05, 523 * jitter(0.03), 0.06, 0.09, "triangle", 784); tone(sfx, now + 0.13, 784 * jitter(0.03), 0.06, 0.12, "triangle", 1047); }
      else if (kind === "early") tone(sfx, now, 220 * jitter(0.04), 0.06, 0.12, "sine", 150);
      else if (kind === "close") { tone(sfx, now, 520, 0.05, 0.08, "square", 520); tone(sfx, now + 0.11, 390, 0.05, 0.1, "square", 390); }
      else if (kind === "pass") tone(sfx, now, 260 * jitter(0.05), 0.08, 0.08, "triangle", 180);
      else if (kind === "onetwo") { tone(sfx, now, 300 * jitter(0.05), 0.08, 0.08, "triangle", 210); tone(sfx, now + 0.1, 659, 0.06, 0.14, "triangle", 988); whoosh(now + 0.05, 0.06, 0.4, 0, 2000); }
      else if (kind === "mud") hiss(sfx, now, 0.35, 0.09, "lowpass", 700, 200, 0.7, 0.01);
      else if (kind === "shield") { tone(sfx, now, 880 * jitter(0.02), 0.08, 0.3, "triangle", 660); hiss(sfx, now, 0.15, 0.06, "highpass", 4000); }
      else if (kind === "boss") { roar(now, 0.08, 1.2); tone(sfx, now, 110, 0.12, 0.35, "triangle", 165); }
      else if (kind === "route") whoosh(now, 0.07, 0.5, s.lane < 0 ? -0.5 : 0.5, 1800);
      // Cut inside a bend: a short whoosh panned to the inside plus a bright two-note lift.
      else if (kind === "inside") { whoosh(now, 0.06, 0.35, s.lane < 0 ? -0.6 : 0.6, 2200); tone(sfx, now + 0.04, 587, 0.05, 0.1, "triangle", 880); }
      else if (kind === "mission") { tone(sfx, now, 784, 0.06, 0.12, "sine", 784); tone(sfx, now + 0.1, 988, 0.06, 0.12, "sine", 988); tone(sfx, now + 0.2, 1319, 0.07, 0.3, "sine", 1319); }
    }
    last.multiplier = multiplier; last.level = s.level; last.cuts = s.cuts; last.jumps = s.jumps; last.landings = s.landings; last.slides = s.slides; last.nearMisses = s.nearMisses; last.collected = s.collected; last.event = s.event;
  }

  return {
    /** Call once per simulated frame while the game is playing. */
    frame(dt: number, s: SoundtrackState) {
      refreshPrefs(dt);
      const context = ensure();
      if (seen !== s) { seen = s; Object.assign(last, { jumps: s.jumps, slides: s.slides, landings: s.landings, cuts: s.cuts, nearMisses: s.nearMisses, event: s.event, collected: s.collected, level: s.level, multiplier: Math.min(3, 1 + Math.floor(s.combo / 6)) }); }
      if (!context || !soundOn) { nextStep = 0; return; }
      const now = context.currentTime;
      // Crowd anticipation builds through a goal approach and settles after.
      const approach = s.objects.some(o => o.kind === "goal" && !o.passed && o.z > -60 && o.z < -6) ? 0.55 : 0;
      hype += ((Math.max(approach, s.boost > 0 ? 0.35 : 0)) - hype) * (1 - Math.exp(-dt * (hype > approach ? 0.9 : 2)));
      events(s, now);
      if (s.lives <= 0 || !musicOn || musicVolume <= 0) { nextStep = 0; return; }
      // Tempo follows running pace: ~100 BPM at kick-off, ~128 at top speed.
      const drive = Math.min(1, Math.max(0, (s.speed - 13) / 5)), bpm = 100 + drive * 28, sixteenth = 60 / bpm / 4;
      if (nextStep < now) { nextStep = now + 0.05; }
      while (nextStep < now + 0.12) { playStep(s, nextStep); nextStep += sixteenth; step = (step + 1) % 64; }
    },
    /** Forget sequencing after a reset so a new run starts on beat one. */
    reset() { step = 0; nextStep = 0; hype = 0; seen = null; },
    dispose() { sfx?.disconnect(); music?.disconnect(); sfx = music = null; ctx = null; noise = null; },
    debug: () => ({ voices, hype, step, musicOn, soundOn }),
  };
}
