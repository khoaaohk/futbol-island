import {isSoundEnabled,getSoundVolume} from '../games/sound';

/**
 * Pass Puzzles voices, "The Tactics Pitch" (docs/arcade-aaa/puzzle-direction.md): the calm corner of Breakaway's world. Soft hand
 * percussion (a cajon tap for the ball, a lighter palm tap for a first touch), brush-and-ink foley (a wet brush swish while the
 * pass is drawn, a dab when it locks on, a print thud for the stars) and one hand-played instrument, a steel pan / kalimba
 * tine on a pentatonic. No crowd, no arcade bleeps, no loop: the pace stays thoughtful. Tiny synthesized one-shots on the game's
 * own AudioContext: no assets, loops or timers. A shared 0.25 s noise buffer is made once per context; every node disconnects
 * when it ends. The tap scales with the ball's speed (a soft pass vs a driven shot sound different).
 */
const noise=new WeakMap<AudioContext,AudioBuffer>(),voices=new WeakMap<AudioContext,number>(),until=new WeakMap<AudioContext,number>(),bus=new WeakMap<AudioContext,AudioNode>();
const MAX_VOICES=8;
/** Pass 2 review (Nov 10 2026). Every voice goes through one small bus per context: a trim and a limiter, so a goal phrase over a
 * driven shot cannot clip at full volume (if the compressor cannot be built the voices go straight out, as before). The voice count
 * heals itself: if a context was interrupted (iOS Safari: a call, the app switcher) and `onended` never fired, the count is
 * dropped once every scheduled voice is past its end, so sound never locks out. Node building is guarded: a throw (a closed or
 * interrupted context, a non-finite value) costs one sound, never the pass. The pencil is one grain of at most 0.1 s per aim
 * preview with no loop and no timer, so it stops by itself the moment the stroke ends or is cancelled. */
function out(ctx:AudioContext):AudioNode{let n=bus.get(ctx);if(!n){try{const trim=ctx.createGain(),limit=ctx.createDynamicsCompressor();trim.gain.value=.9;limit.threshold.value=-9;limit.knee.value=6;limit.ratio.value=12;limit.attack.value=.003;limit.release.value=.12;trim.connect(limit);limit.connect(ctx.destination);n=trim;}catch{n=ctx.destination;}bus.set(ctx,n);}return n;}
function ready(ctx:AudioContext|null):ctx is AudioContext{
 if(ctx&&(voices.get(ctx)??0)>=MAX_VOICES&&ctx.currentTime>(until.get(ctx)??0)+.25)voices.set(ctx,0);
 return !!ctx&&ctx.state==='running'&&typeof document!=='undefined'&&!document.hidden&&isSoundEnabled()&&getSoundVolume()>0&&(voices.get(ctx)??0)<MAX_VOICES;
}
function noiseOf(ctx:AudioContext){let b=noise.get(ctx);if(!b){b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.25),ctx.sampleRate);const d=b.getChannelData(0);let seed=7;for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=seed/1073741823.5-1;}noise.set(ctx,b);}return b;}
function track(ctx:AudioContext,node:AudioScheduledSourceNode,parts:AudioNode[],end:number){voices.set(ctx,(voices.get(ctx)??0)+1);until.set(ctx,Math.max(until.get(ctx)??0,end));node.onended=()=>{voices.set(ctx,Math.max(0,(voices.get(ctx)??1)-1));for(const p of parts){try{p.disconnect();}catch{/* already gone with its context */}}};}
const sane=(...v:number[])=>v.every(n=>Number.isFinite(n)&&n>0);
function tone(ctx:AudioContext,hz:number,at:number,dur:number,level:number,type:OscillatorType='sine',glide=1,attack=.006){
 if(!sane(hz,dur,level,glide))return;try{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz,at);if(glide!==1)o.frequency.exponentialRampToValueAtTime(hz*glide,at+dur);
 g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(level,at+Math.min(attack,dur*.5));g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g);g.connect(out(ctx));o.start(at);o.stop(at+dur+.02);track(ctx,o,[o,g],at+dur+.02);}catch{/* one sound lost */}
}
function thump(ctx:AudioContext,at:number,dur:number,level:number,cutoff:number){
 if(!sane(dur,level,cutoff))return;try{const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseOf(ctx);f.type='lowpass';f.frequency.value=cutoff;
 g.gain.setValueAtTime(level,at);g.gain.exponentialRampToValueAtTime(.0001,at+dur);s.connect(f);f.connect(g);g.connect(out(ctx));s.start(at,0,dur+.02);track(ctx,s,[s,f,g],at+dur+.02);}catch{/* one sound lost */}
}
/** Filtered noise with its own envelope: paper sliding, a pencil grain, a thread net. The shared buffer loops for long voices. */
function air(ctx:AudioContext,at:number,dur:number,level:number,type:BiquadFilterType,hz:number,toHz:number,q=.8,attack=.04){
 if(!sane(dur,level,hz))return;try{const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseOf(ctx);s.loop=dur>.24;f.type=type;f.Q.value=q;
 f.frequency.setValueAtTime(hz,at);f.frequency.exponentialRampToValueAtTime(Math.max(40,toHz||40),at+dur);
 g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(level,at+Math.min(attack,dur*.5));g.gain.exponentialRampToValueAtTime(.0001,at+dur);
 s.connect(f);f.connect(g);g.connect(out(ctx));s.start(at);s.stop(at+dur+.03);track(ctx,s,[s,f,g],at+dur+.03);}catch{/* one sound lost */}
}
/** Hand percussion (a cajon tap): the box's body dropping in pitch as it speaks, a short woody overtone and the palm's slap. */
function knock(ctx:AudioContext,at:number,hz:number,level:number,dur=.09){
 tone(ctx,hz*.74,at,dur*1.35,level*1.1,'sine',.6,.002);tone(ctx,hz*1.9,at,dur*.4,level*.24,'triangle',.85,.002);thump(ctx,at,.03,level*.8,3400);
}
/** One steel-pan / kalimba note: the fundamental, the pan's strong octave ringing nearly as long, and the quick bright strike above them. */
function pluck(ctx:AudioContext,hz:number,at:number,dur:number,level:number){
 tone(ctx,hz,at,dur,level,'sine',.994,.004);tone(ctx,hz*2.01,at,dur*.7,level*.3,'sine',1,.003);tone(ctx,hz*4.2,at,dur*.16,level*.2,'triangle',1,.002);
}
/** Deterministic small jitter so repeated passes never sound identical (no Math.random in the replay path). */
let jitterSeed=1;const jitter=()=>{jitterSeed=(jitterSeed*9301+49297)%233280;return jitterSeed/233280-.5;};
/** C major pentatonic from C5: what every melodic voice here is played on. */
const PENTA=[523,587,659,784,880,1047,1175,1319];

/** The pass: a soft side-foot pass (~8 m/s) is a low wooden knock; a driven shot (~28 m/s) is a sharp rap. */
export function puzzleStrike(ctx:AudioContext|null,speed:number,kind:string){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime,k=Math.min(1,Math.max(0,(speed-6)/24)),j=jitter();
 knock(ctx,t,(kind==='header'?420:230+150*k)*(1+j*.07),v*(.1+.14*k),.07+.05*k);
 thump(ctx,t,.05+.04*k,v*(.08+.14*k),500+900*k);
}
/** First touch: a lighter tock on the felt; thigh/chest softer and lower; a heavy touch is a double clack (the piece rocks). */
export function puzzleTouch(ctx:AudioContext|null,touch:string|undefined,heavy=false){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime,j=jitter();
 const hz=(touch==='chest'?250:touch==='thigh'?300:touch==='header'?470:360)*(1+j*.08);
 knock(ctx,t,hz,v*(heavy?.13:.085),heavy?.1:.06);if(heavy)knock(ctx,t+.085,hz*.84,v*.09,.08);
}
/** Completed pass: one kalimba note, climbing the pentatonic with the number of passes in the move (1 → 4+). */
export function puzzlePassChime(ctx:AudioContext|null,passes:number){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime+.05,hz=PENTA[Math.min(4,Math.max(0,passes-1))];
 pluck(ctx,hz,t,.42,v*.06);
}
/** The offside call: a small pea whistle on the desk, two short trills (never shrill). */
export function puzzleWhistle(ctx:AudioContext|null){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime;
 if(!sane(v))return;for(const [at,dur] of [[0,.14],[.2,.26]] as const){try{const o=ctx.createOscillator(),lfo=ctx.createOscillator(),depth=ctx.createGain(),g=ctx.createGain();
  o.type='triangle';o.frequency.value=2350;lfo.frequency.value=31;depth.gain.value=130;lfo.connect(depth);depth.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t+at);g.gain.linearRampToValueAtTime(v*.034,t+at+.012);g.gain.setValueAtTime(v*.034,t+at+dur-.03);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);
  o.connect(g);g.connect(out(ctx));o.start(t+at);lfo.start(t+at);o.stop(t+at+dur+.02);lfo.stop(t+at+dur+.02);track(ctx,o,[o,lfo,depth,g],t+at+dur+.02);}catch{/* one trill lost */}}
 air(ctx,t,.4,v*.012,'bandpass',2600,2400,2,.02);
}
/** A star is stamped on the result card: the rubber-stamp thud, then its note (n = 1..3 climbs). */
export function puzzleStar(ctx:AudioContext|null,n:number,delay=0){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime+delay,hz=[659,784,1047][Math.min(2,Math.max(0,n-1))];
 thump(ctx,t,.07,v*.16,320);pluck(ctx,hz,t+.015,.4,v*.05);
}

// ── Big-moment voices: still one-shots, voice-capped. ──
/** A driven shot: the ball hisses across the felt, a short rising swish, louder with speed. */
export function puzzleShotWhoosh(ctx:AudioContext|null,speed:number){
 if(!ready(ctx))return;const v=getSoundVolume(),k=Math.min(1,Math.max(0,(speed-10)/20));
 air(ctx,ctx.currentTime+.02,.2+.08*k,v*(.03+.04*k),'bandpass',900,2200+900*k,1.1,.03);
}
/** Goal: the thread net shivers, then a short hand-played kalimba phrase (longer for a longer move) and two soft claps from the coach. */
export function puzzleGoalRoar(ctx:AudioContext|null,passes:number){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime,big=Math.min(1,.55+passes*.15);
 air(ctx,t,.3,v*.07,'highpass',2800,1500,.6,.01);
 // G4 C5 E5 G5, then the answer (A5 G5 or up to C6): played by hand, so the gaps are not quite even.
 const phrase=passes>=2?[392,523,659,784,880,1047]:[392,523,659,784,659];let at=t+.16;
 phrase.forEach((hz,i)=>{pluck(ctx,hz,at,i===phrase.length-1?.9:.5,v*(.05+.02*big));at+=.115+jitter()*.03+(i===3?.07:0);});
 for(const c of [.62,.86])air(ctx,t+c+jitter()*.02,.09,v*.05*big,'bandpass',1500,1100,.9,.004);
}
/** A block or save: the table's "ooh" is a sheet of paper sliding and a low wooden roll, falling. */
export function puzzleCrowdOoh(ctx:AudioContext|null){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime+.05;air(ctx,t,.5,v*.04,'bandpass',1400,500,1.2,.08);tone(ctx,196,t,.34,v*.035,'sine',.7,.02);
}
/** A named combination (one-two, first time, tiki-taka): two quick plucks a fifth apart, higher for a goal. */
export function puzzleCombo(ctx:AudioContext|null,tier:number){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime+.09,root=tier>=3?784:659;
 pluck(ctx,root,t,.28,v*.045);pluck(ctx,root*1.5,t+.085,.4,v*.045);
}
/** First-try streak on the result card: one extra note per streak step (capped at 5). */
export function puzzleStreak(ctx:AudioContext|null,n:number,delay=0){
 if(!ready(ctx)||n<2)return;const v=getSoundVolume(),t=ctx.currentTime+delay;
 for(let i=0;i<Math.min(5,n);i++)pluck(ctx,PENTA[i],t+i*.09,.3,v*.04);
}

/* Polish voices (same pool: MAX_VOICES, shared noise buffer, nodes disconnect on end; no assets, loops or timers). */
/** Aim snap: the pencil tip taps the felt when the drawn pass locks onto a teammate (brighter when the lane is clear, duller when blocked). */
export function puzzleSnapTick(ctx:AudioContext|null,clear:boolean){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime,j=jitter();
 tone(ctx,(clear?1180:560)*(1+j*.04),t,.03,v*.026,'triangle',1,.002);thump(ctx,t,.012,v*.05,clear?4200:1600);
}
/** A defender steals it: two pieces clack together, low and soft (never harsh: a kid hears it a lot). */
export function puzzleIntercept(ctx:AudioContext|null){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime;
 knock(ctx,t,205,v*.12,.1);knock(ctx,t+.07,172,v*.08,.12);
}
/** Menu and card taps: a paper flick. */
export function puzzleUiTap(ctx:AudioContext|null){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime,j=jitter();air(ctx,t,.045,v*.05,'highpass',2400*(1+j*.2),3600,.7,.003);tone(ctx,720*(1+j*.05),t,.025,v*.012,'triangle');
}
/** The cup multiplier counting up on the result card: one rising pluck per skill (step 0..4). */
export function puzzleSkillChime(ctx:AudioContext|null,step:number,delay=0){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime+delay;
 pluck(ctx,PENTA[Math.max(0,Math.min(PENTA.length-1,step+2))],t,.22,v*.034);
}
/** A new personal best (cup points or a full 3 stars): a four-note rise that rings on, with the stamp under the last note. */
export function puzzleNewBest(ctx:AudioContext|null,delay=0){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime+delay;
 [523,659,784,1047].forEach((hz,i)=>pluck(ctx,hz,t+i*.085,i===3?.8:.3,v*.04));thump(ctx,t+.255,.07,v*.12,320);
}
/** Comic pass (Nov 10 2026): a loaded brush pulled across the pitch while the pass is drawn. One short grain per call (the game
 * calls it at most once per aim preview, ~12 a second, only while the finger moves); faster strokes are brighter and a touch louder. */
export function puzzlePencil(ctx:AudioContext|null,speed:number){
 if(!ready(ctx))return;const v=getSoundVolume(),k=Math.min(1,Math.max(0,speed/30)),j=jitter();
 air(ctx,ctx.currentTime,.09+.03*k,v*(.02+.034*k),'bandpass',(780+900*k)*(1+j*.25),520+500*k,.8,.022);
}
/** Aim anywhere (Nov 11 2026). Post or bar: a hollow woodwork knock with a short ring (the bar rings a little higher). Same bus, no new wiring. */
export function puzzleWoodwork(ctx:AudioContext|null,bar=false){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime,hz=bar?392:330;
 knock(ctx,t,hz,v*.16,.12);knock(ctx,t+.012,hz*2.02,v*.07,.16);tone(ctx,hz*2.76,t,.22,v*.03,'triangle',.99,.002);
}
/** A high finish: the net ripples up top, a brushed sweep with two quick mesh ticks, over the goal phrase. */
export function puzzleNetHigh(ctx:AudioContext|null){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime;
 air(ctx,t,.24,v*.09,'bandpass',2600,5200,1.2,.02);knock(ctx,t+.03,620,v*.04,.05);knock(ctx,t+.085,700,v*.03,.05);
}
