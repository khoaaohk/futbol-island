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
  /** First-run coach (runnerCoach.ts): beats offered this run and the slow-motion time scale. */
  coachCount?: number; coachScale?: number;
  /** Body rhythm (Oct 25 2026): stride phase (radians), height, slide, balls held and combo tier drops. */
  stride?: number; y?: number; slide?: number; balls?: number; comboDrops?: number;
  /** Round 3 (Oct 26 2026): terrain under the boots, finished route, won route, thunder claps, hearts back. */
  terrain?: string; finished?: boolean; won?: boolean; thunder?: number; heartsBack?: number;
  /** Nov 8 2026: the live perfect-dodge chain (1, 2, 3 …): its chime climbs one step per link. */
  perfectChain?: number;
};
/** Footstep colour per surface: [thud Hz, crunch filter Hz, crunch level, extra: 0 none, 1 hard click, 2 hollow board knock, 3 wet squelch].
 * Nov 10 2026 revoice: the coast road changes underfoot (turf, sand, cobbles, chalk, mud, painted pier, roof tiles, bridge boards). */
const STEP_SOUND: Record<string, readonly [number, number, number, number]> = {
  grass: [84, 1200, 0.02, 0], sand: [64, 3800, 0.045, 0], cobbles: [118, 2800, 0.014, 1], snow: [76, 5200, 0.034, 0],
  mud: [58, 420, 0.04, 3], neon: [128, 3000, 0.01, 1], rooftop: [150, 2200, 0.012, 1], bridge: [92, 1500, 0.014, 2],
};
/* Chase groove (Nov 10 2026, docs/arcade-aaa/runner-direction.md): hand percussion and a palm-muted string ostinato in A minor
 * pentatonic (Am F C G), every voice synthesized. Layers follow the clean-play multiplier: x1 cajon, shaker, ostinato and bass;
 * x2 adds claps and a steel-pan lead; x3 adds brass stabs and a timbale fill. */
const BASS = [55, 43.65, 65.41, 49]; // A F C G
const CHORDS = [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 261.63, 329.63], [196, 246.94, 293.66]];
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
const TRESILLO = [0, 3, 6, 8, 11, 14], LEAD = [4, 2, 4, 5, 4, 2, 1, 2, 0, 1, 2, 4, 2, 1, 0, 1];
const VOICE_CAP = 28, MUSIC_CAP = 20; // Nov 10 2026 review: the groove leaves eight voices free, so a strike or a goal is never the voice that gets dropped

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
  /* Nov 10 2026 review. `limiter`: the one brick-wall stage every runner voice passes (a blast + roar + groove summed past full scale
   * at high volume). `gate`: a dead-man's switch on the music bus: every played frame re-arms it, so when frames stop (pause, a
   * sleeping tab, leaving the game) the groove and its two-second pads fade out on the audio thread within a third of a second.
   * `stuck`: if an `ended` event is ever lost (an interrupted iOS context), the voice counter heals instead of muting the game. */
  let limiter: DynamicsCompressorNode | null = null, gate: GainNode | null = null, stuck = 0, tailUntil = 0;
  let voices = 0, nextStep = 0, step = 0, prefClock = 99, soundOn = true, sfxVolume = 0.5, musicOn = true, musicVolume = 0.04;
  let hype = 0, seen: SoundtrackState | null = null;
  const last = { foot: 0, drops: 0, jumps: 0, slides: 0, landings: 0, cuts: 0, nearMisses: 0, event: 0, collected: 0, level: 1, multiplier: 1, coach: 0, thunder: 0, hearts: 0 };
  let seed = 90127;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const jitter = (amount: number) => 1 + (rand() * 2 - 1) * amount;

  function ensure() {
    const context = getContext();
    if (!context || context.state !== "running") return null;
    if (context !== ctx) {
      ctx = context; voices = 0; nextStep = 0;
      // A context without a compressor (very old WebKit, test doubles) plays straight through instead of throwing.
      limiter = null; let out: AudioNode = context.destination;
      if (typeof context.createDynamicsCompressor === "function") { limiter = context.createDynamicsCompressor(); limiter.threshold.value = -6; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.003; limiter.release.value = 0.12; limiter.connect(context.destination); out = limiter; }
      sfx = context.createGain(); sfx.connect(out);
      gate = context.createGain(); gate.gain.value = typeof gate.gain.setTargetAtTime === "function" ? 0 : 1; gate.connect(out);
      music = context.createGain(); music.connect(gate); stuck = 0; tailUntil = 0;
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
    if (!ctx || voices >= (bus === music ? MUSIC_CAP : VOICE_CAP) || peak <= 0) return;
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
    if (!ctx || !noise || voices >= (bus === music ? MUSIC_CAP : VOICE_CAP) || peak <= 0) return;
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain(), nodes: AudioNode[] = [src, filter, gain];
    src.buffer = noise; filter.type = type; filter.Q.value = q; filter.frequency.setValueAtTime(from, at);
    if (to !== from) filter.frequency.exponentialRampToValueAtTime(to, at + duration);
    gain.gain.setValueAtTime(0.0001, at); gain.gain.linearRampToValueAtTime(peak, at + attack); gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    src.connect(filter); filter.connect(gain);
    if (pan && typeof ctx.createStereoPanner === "function") { const p = ctx.createStereoPanner(); p.pan.value = pan; gain.connect(p); p.connect(bus); nodes.push(p); } else gain.connect(bus);
    voices++; src.onended = release(nodes);
    src.start(at, rand() * Math.max(0, noise.duration - duration - 0.06), duration + 0.05);
  }

  /** Steel pan: a round fundamental with a quick octave ring and a click of third harmonic. */
  function pan(bus: GainNode, at: number, hz: number, peak: number, side = 0) { tone(bus, at, hz, peak, 0.34, "sine", 0, side); tone(bus, at, hz * 2.01, peak * 0.42, 0.13, "sine", 0, side); tone(bus, at, hz * 3, peak * 0.14, 0.045, "triangle", 0, side); }
  function playStep(s: SoundtrackState, at: number) {
    if (!music) return;
    const bar = Math.floor(step / 16) % 4, beat = step % 16, chord = CHORDS[bar], drive = Math.min(1, Math.max(0, (s.speed - 13) / 5));
    const level = s.level, boost = s.boost > 0, mult = Math.min(3, 1 + Math.floor(s.combo / 6)) + (boost ? 1 : 0);
    // Cajon bass on 1 and 3, pushed by a pickup from stage 2: a low thump with a breath of box air.
    if (beat % 8 === 0 || (level >= 2 && beat === 14) || (mult >= 3 && beat === 6)) { tone(music, at, 96 * jitter(0.02), 0.5, 0.17, "sine", 46); hiss(music, at, 0.05, 0.1, "lowpass", 380, 160, 0.7, 0.002); }
    // Cajon slap on 2 and 4: a dry woody crack.
    if (beat % 8 === 4) { hiss(music, at, 0.07, 0.2 * jitter(0.12), "bandpass", 2300, 1500, 1.7, 0.002); tone(music, at, 232 * jitter(0.03), 0.09, 0.05, "triangle", 170); }
    // Shaker: straight sixteenths that lean on the off-beat and get busier with pace.
    if (beat % 2 === 0 || drive > 0.35 || mult >= 2) hiss(music, at, beat % 4 === 2 ? 0.05 : 0.028, (beat % 4 === 2 ? 0.075 : 0.035) * (0.8 + drive * 0.6) * jitter(0.25), "highpass", 6800, 6800, 0.7, 0.004, beat % 2 ? 0.25 : -0.25);
    // Palm-muted string ostinato on a 3-3-2 pattern: the running figure of the chase.
    if (TRESILLO.includes(beat)) { const i = TRESILLO.indexOf(beat), note = chord[i % 3] * (i === 3 || i === 5 ? 2 : 1); tone(music, at, note * jitter(0.003), 0.085 + drive * 0.03, 0.085, "triangle", 0, -0.2); tone(music, at, note * 2, 0.02, 0.03, "square", 0, -0.2); }
    // Bass: root on 1, the fifth pushing into 3, the octave on the last push.
    if (beat === 0 || beat === 6 || beat === 11) tone(music, at, BASS[bar] * (beat === 6 ? 1.5 : beat === 11 ? 2 : 1), 0.27, 0.2, "triangle");
    // x2: hand claps answer the slap, and a steel pan takes the tune.
    if (mult >= 2 && (beat === 4 || beat === 12 || beat === 13)) { hiss(music, at, 0.09, 0.11 * jitter(0.15), "bandpass", 1350, 1100, 1.3, 0.003, 0.3); hiss(music, at + 0.012, 0.09, 0.08 * jitter(0.15), "bandpass", 1650, 1200, 1.3, 0.003, -0.3); }
    if (mult >= 2 && (beat % 4 === 0 || beat % 8 === 6 || (mult >= 3 && beat % 8 === 3))) pan(music, at, PENTA[LEAD[(Math.floor(step / 2) + bar * 3) % LEAD.length]], 0.05 + hype * 0.02, 0.3);
    // x3: brass stabs on the pushes and a timbale run into the next bar. The sound of being on fire.
    if (mult >= 3 && (beat === 0 || beat === 10)) chord.forEach((hz, i) => tone(music!, at + i * 0.006, hz * 2, 0.03, 0.16, "sawtooth", hz * 2.02, (i - 1) * 0.3));
    if (mult >= 3 && bar % 2 === 1 && beat >= 13) tone(music, at, (430 - (beat - 13) * 70) * jitter(0.02), 0.09, 0.09, "sine", 250 - (beat - 13) * 30, 0.4);
    // A held chord swells through a goal approach or a power run (three voices a bar at most).
    if (beat === 0 && (hype > 0.3 || boost)) chord.forEach((hz, i) => tone(music!, at + i * 0.012, hz / 2, 0.035, 1.9, "sine", 0, (i - 1) * 0.35));
    // Crowd murmur: overlapping soft noise grains each beat; louder near a goal.
    if (beat % 4 === 0 && sfx) { const centre = 520 + rand() * 420; hiss(sfx, at, 0.9, (0.012 + hype * 0.05) * jitter(0.3), "bandpass", centre, centre, 0.7, 0.3, (rand() * 2 - 1) * 0.6); }
  }

  function whoosh(at: number, peak: number, duration: number, pan: number, high = 2800) { if (sfx) hiss(sfx, at, duration, peak, "bandpass", high * jitter(0.12), 420, 1.4, 0.03, pan); }
  function roar(at: number, peak: number, duration: number) { if (!sfx) return; hiss(sfx, at, duration, peak, "bandpass", 650, 900, 0.6, 0.18, -0.3); hiss(sfx, at + 0.05, duration, peak * 0.8, "bandpass", 1050, 1300, 0.7, 0.2, 0.3); }
  /** Round clear (endless play): steel pan G5 → C6 over one cajon tap. 0.46 s from the first note to silence; no whistle, no roar. */
  function roundClear(at: number) { if (!sfx) return; tone(sfx, at, 104, 0.1, 0.11, "sine", 58); pan(sfx, at, 783.99, 0.06, -0.15); pan(sfx, at + 0.12, 1046.5, 0.07, 0.15); }
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
    // Coach beat: time slows. A falling whoosh and a low glide say "slow motion" without words.
    if ((s.coachCount ?? 0) > last.coach) { hiss(sfx, now, 0.55, 0.07, "bandpass", 3200, 380, 1.2, 0.02); tone(sfx, now, 440, 0.05, 0.5, "sine", 180); }
    if (s.cuts !== last.cuts) { whoosh(now, 0.035 * jitter(0.2), 0.16, s.cutDir * 0.5, 2200); tone(sfx, now + 0.02, 150 * jitter(0.08), 0.05, 0.06, "triangle", 90); }
    if (s.jumps !== last.jumps) { tone(sfx, now, 260 * jitter(0.06), 0.06, 0.16, "sine", 520); whoosh(now, 0.025, 0.2, 0, 1800); }
    if (s.landings !== last.landings) tone(sfx, now, 110 * jitter(0.08), 0.08, 0.09, "sine", 60);
    if (s.slides !== last.slides) hiss(sfx, now, 0.38, 0.06, "lowpass", 1400, 380, 0.6, 0.02);
    // Near miss: the tackler's air rushes past the ear (a fast falling band of noise, a doppler glide under it), then two pan notes.
    if (s.nearMisses !== last.nearMisses) { const side = s.cutDir * 0.8; hiss(sfx, now, 0.26, 0.16, "bandpass", 5200, 520, 2.2, 0.012, -side); hiss(sfx, now + 0.03, 0.34, 0.07, "highpass", 3000, 900, 0.7, 0.05, side); tone(sfx, now, 940, 0.05, 0.24, "sine", 300, -side); pan(sfx, now + 0.1, 783.99, 0.04); pan(sfx, now + 0.17, 1174.66, 0.035); }
    if (s.collected !== last.collected) {
      // Rising ladder while touches stay clean: a kind, musical streak cue.
      const rung = PENTA[Math.min(PENTA.length - 1, s.combo % PENTA.length)];
      tone(sfx, now, rung * jitter(0.01), 0.035, 0.14, "triangle");
    }
    // Multiplier dropped a tier after a save: a soft two-note "aw" (gentle, so a miss never sounds like a punishment).
    if ((s.comboDrops ?? 0) > last.drops) { tone(sfx, now + 0.12, 659, 0.035, 0.12, "sine"); tone(sfx, now + 0.24, 494, 0.035, 0.2, "sine"); }
    // Footsteps and dribble taps (Oct 25 2026): one soft thud per foot strike from the stride phase, a ball tap every
    // other step while dribbling. Silent in the air, while sliding and after full time. About three steps a second.
    if (s.stride !== undefined) {
      const foot = Math.floor(s.stride / Math.PI);
      if (foot !== last.foot && s.lives > 0 && !s.finished && (s.y ?? 0) < 0.05 && (s.slide ?? 0) < 0.1) {
        const side = foot % 2 ? 0.18 : -0.18, step = STEP_SOUND[s.terrain ?? "grass"] ?? STEP_SOUND.grass;
        tone(sfx, now, step[0] * jitter(0.1), s.boost > 0 ? 0.06 : 0.045, 0.06, "sine", step[0] * 0.6, side);
        hiss(sfx, now, 0.05, step[2] * jitter(0.3), "lowpass", step[1], step[1] * 0.4, 0.6, 0.003, side);
        if (step[3] === 1 && foot % 2) tone(sfx, now + 0.005, 1800 * jitter(0.1), 0.012, 0.02, "square", 1200, side);
        else if (step[3] === 2) tone(sfx, now + 0.004, 196 * jitter(0.08), 0.04, 0.07, "triangle", 120, side);
        else if (step[3] === 3) hiss(sfx, now + 0.02, 0.09, 0.03, "bandpass", 300, 900, 2.5, 0.03, side);
        if (foot % 2 === 0 && (s.balls ?? 1) > 0 && !s.charging) tone(sfx, now + 0.015, 330 * jitter(0.05), 0.022, 0.04, "triangle", 250, side * 0.5);
      }
      last.foot = foot;
    }
    // Clean-run multiplier up: a short rising arpeggio (reward, never a warning).
    const multiplier = Math.min(3, 1 + Math.floor(s.combo / 6));
    if (multiplier > last.multiplier) PENTA.slice(1, 4).forEach((hz, i) => tone(sfx!, now + i * 0.06, hz * multiplier / 2, 0.045, 0.18, "triangle"));
    // New stage: the crowd lifts.
    if (s.level > last.level) roar(now, 0.08, 1.4);
    // Storm: a low rolling thunder (noise through a low-pass), never loud.
    if ((s.thunder ?? 0) > last.thunder) { hiss(sfx, now, 1.6, 0.07, "lowpass", 260, 80, 0.5, 0.08); tone(sfx, now, 48, 0.06, 1.2, "sine", 36); }
    // A heart back: a warm two-note lift.
    if ((s.heartsBack ?? 0) > last.hearts) { tone(sfx, now + 0.3, 659, 0.05, 0.12, "sine"); tone(sfx, now + 0.42, 988, 0.05, 0.25, "sine"); }
    if (s.event !== last.event) {
      const kind = s.eventKind;
      // Struck ball: a dry leather crack (a few milliseconds of bright noise, a knock of mid), a boot thump under it; a blast adds a sub
      // drop, a second crack and the air the ball tears through.
      if (kind === "shot") { const blast = s.lastBlast >= 0.8; hiss(sfx, now, 0.022, blast ? 0.34 : 0.22, "highpass", 3200, 3200, 0.7, 0.001); hiss(sfx, now, 0.06, blast ? 0.2 : 0.13, "bandpass", 1700 * jitter(0.06), 900, 2.4, 0.001); tone(sfx, now, (blast ? 150 : 185) * jitter(0.06), blast ? 0.26 : 0.15, blast ? 0.26 : 0.12, "sine", blast ? 40 : 72);
        if (blast) { tone(sfx, now + 0.01, 70, 0.16, 0.34, "sine", 32); hiss(sfx, now + 0.035, 0.03, 0.16, "highpass", 2400, 2400, 0.7, 0.001); hiss(sfx, now + 0.03, 0.5, 0.1, "bandpass", 2600, 500, 1.2, 0.04); } }
      else if (kind === "clear") tone(sfx, now, 95 * jitter(0.1), 0.12, 0.18, "triangle", 55);
      else if (kind === "goal") {
        roar(now + 0.03, 0.16, 2.1); hype = 1;
        // Net swish, then a short bright fanfare on the music bus (silent when music is off).
        hiss(sfx, now + 0.02, 0.36, 0.1, "highpass", 5200, 2000, 0.7, 0.01); tone(sfx, now + 0.05, 1250, 0.035, 0.22, "sine", 2500);
        // Steel-pan fanfare with a cajon hit under it, on the music bus (silent when music is off).
        if (music) { [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) => pan(music!, now + 0.08 + i * 0.085, hz, i === 3 ? 0.11 : 0.08, (i - 1.5) * 0.3)); tone(music, now + 0.08, 96, 0.4, 0.2, "sine", 44); }
        // Round clear at the goal line (endless play, Nov 10 2026 touch-up: every goal-line goal clears a round and the run carries on, so
        // the full-time whistle and victory phrase no longer play here). A short, light cue instead: two rising steel-pan notes over a
        // cajon tap on the effects bus (heard with music off), done inside a second. The full fanfare waits for full time, below.
        if (s.won) roundClear(now + 0.42);
      }
      // An open round cleared without a goal (no goal line on this route): the same light cue.
      else if (kind === "round") roundClear(now + 0.05);
      else if (kind === "save") { tone(sfx, now, 170 * jitter(0.06), 0.13, 0.1, "sine", 70); hiss(sfx, now, 0.07, 0.07, "lowpass", 700, 300); hiss(sfx, now + 0.05, 0.9, 0.08, "bandpass", 900, 380, 1.2, 0.12); } // glove thump + // crowd "ooh"
      else if (kind === "block") tone(sfx, now, 140 * jitter(0.06), 0.12, 0.12, "triangle", 80);
      else if (kind === "hit") {
        tone(sfx, now, 90 * jitter(0.06), 0.22, 0.26, "sine", 40); hiss(sfx, now, 0.12, 0.08, "lowpass", 900, 300);
        if (s.lives <= 0) {
          whistle(now + 0.25); hiss(sfx, now + 0.35, 1.3, 0.07, "bandpass", 700, 330, 0.9, 0.25);
          // A warm "well played" close after the whistle (rising, never a sad trombone), then the crowd applauds.
          // Full time after at least one goal-line finish: the full "route won" fanfare (the long victory phrase on the effects bus, heard
          // with music off), kept for the end-of-run results only. Otherwise the warm close on the music bus, as before.
          if (s.won) [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((hz, i) => tone(sfx!, now + 1.3 + i * 0.13, hz, 0.06, i === 4 ? 0.8 : 0.18, "triangle"));
          else if (music) { tailUntil = now + 2.7; /* the full-time phrase outlives the last frame: hold the gate open for it */ [392, 523.25, 659.25, 783.99].forEach((hz, i) => tone(music!, now + 1.3 + i * 0.16, hz, 0.07, i === 3 ? 0.7 : 0.22, "triangle")); }
          for (let i = 0; i < 4; i++) hiss(sfx, now + 1.4 + i * 0.11, 0.08, 0.04 * jitter(0.3), "bandpass", 1600, 1600, 1.4, 0.004, (i % 2 ? 0.4 : -0.4));
        }
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
      else if (kind === "best") { roar(now, 0.1, 1.4); PENTA.slice(2, 6).forEach((hz, i) => tone(sfx!, now + i * 0.07, hz, 0.05, 0.2, "triangle")); }
      else if (kind === "terrain") { whoosh(now, 0.05, 0.45, 0, 1500); tone(sfx, now + 0.05, 440, 0.035, 0.18, "triangle", 660); }
      else if (kind === "finalhill") { roar(now, 0.1, 1.6); [392, 523.25, 659.25].forEach((hz, i) => tone(sfx!, now + i * 0.12, hz, 0.05, 0.2, "triangle")); }
      else if (kind === "combo") { tone(sfx, now, 330, 0.05, 0.1, "square", 330); tone(sfx, now + 0.12, 494, 0.05, 0.14, "square", 494); }
      else if (kind === "power") { whoosh(now, 0.08, 0.5, 0, 3000); PENTA.slice(0, 4).forEach((hz, i) => tone(sfx!, now + i * 0.05, hz, 0.045, 0.15, "triangle")); }
      // Perfect dodge (Nov 8 2026): the near-miss whoosh already plays; on top, a two-note chime that climbs one pentatonic step per
      // link of the chain, so a kid hears the multiplier grow. Two pooled voices (VOICE_CAP still bounds everything).
      else if (kind === "perfect") { const c = Math.max(1, Math.min(4, s.perfectChain ?? 1)); tone(sfx, now + 0.06, PENTA[c] * 2 * jitter(0.01), 0.05, 0.1, "triangle"); tone(sfx, now + 0.13, PENTA[c + 1] * 2 * jitter(0.01), 0.05, 0.18 + c * 0.03, "triangle"); }
      else if (kind === "mission") { tone(sfx, now, 784, 0.06, 0.12, "sine", 784); tone(sfx, now + 0.1, 988, 0.06, 0.12, "sine", 988); tone(sfx, now + 0.2, 1319, 0.07, 0.3, "sine", 1319); }
    }
    last.drops = s.comboDrops ?? 0; last.multiplier = multiplier; last.level = s.level; last.cuts = s.cuts; last.jumps = s.jumps; last.landings = s.landings; last.slides = s.slides; last.nearMisses = s.nearMisses; last.collected = s.collected; last.event = s.event; last.thunder = s.thunder ?? 0; last.hearts = s.heartsBack ?? 0; last.coach = s.coachCount ?? 0;
  }

  return {
    /** Call once per simulated frame while the game is playing. */
    frame(dt: number, s: SoundtrackState) {
      refreshPrefs(dt);
      const context = ensure();
      if (seen !== s) { seen = s; Object.assign(last, { foot: Math.floor((s.stride ?? 0) / Math.PI), drops: s.comboDrops ?? 0, coach: s.coachCount ?? 0, jumps: s.jumps, slides: s.slides, landings: s.landings, cuts: s.cuts, nearMisses: s.nearMisses, event: s.event, collected: s.collected, level: s.level, multiplier: Math.min(3, 1 + Math.floor(s.combo / 6)), thunder: s.thunder ?? 0, hearts: s.heartsBack ?? 0 }); }
      if (!context || !soundOn) { nextStep = 0; return; }
      const now = context.currentTime;
      if (voices >= MUSIC_CAP) { stuck += dt; if (stuck > 3) { voices = 0; stuck = 0; } } else stuck = 0;
      if (gate && typeof gate.gain.setTargetAtTime === "function") { const hold = Math.max(now + 0.3, tailUntil); gate.gain.cancelScheduledValues?.(now); gate.gain.setTargetAtTime(1, now, 0.02); gate.gain.setTargetAtTime(0, hold, 0.06); }
      // Crowd anticipation builds through a goal approach and settles after.
      const approach = s.objects.some(o => o.kind === "goal" && !o.passed && o.z > -60 && o.z < -6) ? 0.55 : 0;
      hype += ((Math.max(approach, s.boost > 0 ? 0.35 : 0)) - hype) * (1 - Math.exp(-dt * (hype > approach ? 0.9 : 2)));
      events(s, now);
      if (s.lives <= 0 || s.finished || !musicOn || musicVolume <= 0) { nextStep = 0; return; }
      // Tempo follows running pace: ~100 BPM at kick-off, ~128 at top speed.
      const drive = Math.min(1, Math.max(0, (s.speed - 13) / 5)), bpm = (100 + drive * 28) * (0.55 + 0.45 * (s.coachScale ?? 1)), sixteenth = 60 / bpm / 4;
      if (nextStep < now) { nextStep = now + 0.05; }
      while (nextStep < now + 0.12) { playStep(s, nextStep); nextStep += sixteenth; step = (step + 1) % 64; }
    },
    /** Forget sequencing after a reset so a new run starts on beat one. */
    reset() { step = 0; nextStep = 0; hype = 0; seen = null; tailUntil = 0; },
    dispose() { sfx?.disconnect(); music?.disconnect(); gate?.disconnect(); limiter?.disconnect(); sfx = music = gate = null; limiter = null; ctx = null; noise = null; },
    debug: () => ({ voices, hype, step, musicOn, soundOn, limiter: !!limiter, gate: !!gate }),
  };
}
