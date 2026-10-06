import {isSoundEnabled,getSoundVolume} from '../games/sound';

/**
 * Pass Puzzles voices: tiny synthesized one-shots on the game's own AudioContext. No assets, loops or
 * timers. The strike thump scales with the ball's speed (a soft pass vs a driven shot sound different),
 * touches vary by body part, the offside call is a referee whistle, and stars chime up a scale.
 * A shared 0.25 s noise buffer is made once per context; every node disconnects when it ends.
 */
const noise=new WeakMap<AudioContext,AudioBuffer>(),voices=new WeakMap<AudioContext,number>();
const MAX_VOICES=8;
function ready(ctx:AudioContext|null):ctx is AudioContext{
 return !!ctx&&ctx.state==='running'&&typeof document!=='undefined'&&!document.hidden&&isSoundEnabled()&&getSoundVolume()>0&&(voices.get(ctx)??0)<MAX_VOICES;
}
function noiseOf(ctx:AudioContext){let b=noise.get(ctx);if(!b){b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.25),ctx.sampleRate);const d=b.getChannelData(0);let seed=7;for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=seed/1073741823.5-1;}noise.set(ctx,b);}return b;}
function track(ctx:AudioContext,node:AudioScheduledSourceNode,parts:AudioNode[]){voices.set(ctx,(voices.get(ctx)??0)+1);node.onended=()=>{voices.set(ctx,Math.max(0,(voices.get(ctx)??1)-1));for(const p of parts)p.disconnect();};}
function tone(ctx:AudioContext,hz:number,at:number,dur:number,level:number,type:OscillatorType='sine',glide=1){
 const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz,at);if(glide!==1)o.frequency.exponentialRampToValueAtTime(hz*glide,at+dur);
 g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(level,at+.006);g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g);g.connect(ctx.destination);o.start(at);o.stop(at+dur+.02);track(ctx,o,[o,g]);
}
function thump(ctx:AudioContext,at:number,dur:number,level:number,cutoff:number){
 const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseOf(ctx);f.type='lowpass';f.frequency.value=cutoff;
 g.gain.setValueAtTime(level,at);g.gain.exponentialRampToValueAtTime(.0001,at+dur);s.connect(f);f.connect(g);g.connect(ctx.destination);s.start(at,0,dur+.02);track(ctx,s,[s,f,g]);
}
/** Deterministic small jitter so repeated passes never sound identical (no Math.random in the replay path). */
let jitterSeed=1;const jitter=()=>{jitterSeed=(jitterSeed*9301+49297)%233280;return jitterSeed/233280-.5;};

/** Boot on ball: a soft side-foot pass (~8 m/s) is a low tap; a driven shot (~28 m/s) is a sharp crack. */
export function puzzleStrike(ctx:AudioContext|null,speed:number,kind:string){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime,k=Math.min(1,Math.max(0,(speed-6)/24)),j=jitter();
 thump(ctx,t,.06+.05*k,v*(.18+.32*k),900+2600*k);
 tone(ctx,(kind==='header'?260:150+120*k)*(1+j*.08),t,.07+.04*k,v*(.05+.06*k),'triangle',.55);
}
/** First touch: feet tap, thigh/chest cushion (lower, softer), heavy touch (scuffed). */
export function puzzleTouch(ctx:AudioContext|null,touch:string|undefined,heavy=false){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime,j=jitter();
 const hz=touch==='chest'?140:touch==='thigh'?175:touch==='header'?240:210;
 thump(ctx,t,heavy?.11:.05,v*(heavy?.3:.14),heavy?1800:touch==='chest'?500:1100);
 tone(ctx,hz*(1+j*.1),t,heavy?.12:.06,v*.05,'sine',heavy?.6:.8);
}
/** Completed pass chime: rises with the number of passes in the move (1 → 3+). */
export function puzzlePassChime(ctx:AudioContext|null,passes:number){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime+.04,steps=[523,587,659,784];const hz=steps[Math.min(steps.length-1,Math.max(0,passes-1))];
 tone(ctx,hz,t,.12,v*.04);tone(ctx,hz*1.5,t+.05,.1,v*.025);
}
/** The referee's offside whistle: two short trills. */
export function puzzleWhistle(ctx:AudioContext|null){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime;
 for(const [at,dur] of [[0,.16],[.22,.3]] as const){const o=ctx.createOscillator(),lfo=ctx.createOscillator(),depth=ctx.createGain(),g=ctx.createGain();
  o.type='square';o.frequency.value=2650;lfo.frequency.value=28;depth.gain.value=110;lfo.connect(depth);depth.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t+at);g.gain.linearRampToValueAtTime(v*.03,t+at+.01);g.gain.setValueAtTime(v*.03,t+at+dur-.03);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);
  o.connect(g);g.connect(ctx.destination);o.start(t+at);lfo.start(t+at);o.stop(t+at+dur+.02);lfo.stop(t+at+dur+.02);track(ctx,o,[o,lfo,depth,g]);}
}
/** A star lands on the result card: n = 1..3 climbs the scale. */
export function puzzleStar(ctx:AudioContext|null,n:number,delay=0){
 if(!ready(ctx))return;const v=getSoundVolume(),t=ctx.currentTime+delay,hz=[659,784,1047][Math.min(2,Math.max(0,n-1))];
 tone(ctx,hz,t,.22,v*.05);tone(ctx,hz*2,t+.02,.16,v*.018);
}
