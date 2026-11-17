/**
 * Line Up! sound (Nov 17 2026): wood blocks, felt taps, a stadium clap and a short horn for the comic pitch; synthesised, no files.
 * Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (never back into itself or the master:
 * tests/lineup-core.cjs greps this wiring; scripts/check-arcade-audio.cjs measures real output). The context is made on the first
 * tap (unlock) and resumed there, so nothing plays before a gesture. No loops or timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

/** A clear climbs this scale: each line in a combo and each step of a streak lifts the chord (semitones above C5). */
export const LINE_SCALE=[0,2,4,7,9,12,14,16,19,21,24] as const;
const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
export type LineupAudio=ReturnType<typeof createLineupAudio>;
export function createLineupAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.9;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.12;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.5);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=7654321;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
  if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 function tone(type:OscillatorType,f0:number,f1:number,at:number,dur:number,gain:number,attack=.004){
  if(!ctx||!master||voices>24)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);o.onended=()=>{voices--;o.disconnect();g.disconnect();};
 }
 function burst(filter:BiquadFilterType,f:number,q:number,at:number,dur:number,gain:number,sweepTo=0){
  if(!ctx||!master||!noise||voices>24)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  src.buffer=noise;bq.type=filter;bq.frequency.setValueAtTime(f,t);bq.Q.value=q;if(sweepTo)bq.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);
  g.gain.setValueAtTime(gain*vol(),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*7.3)%.3,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** Marimba-like bar: sine + a quiet 4th partial, quick decay. */
 const bar=(f:number,at:number,gain=.2,dur=.28)=>{tone('sine',f,f,at,dur,gain,.003);tone('sine',f*3.98,f*3.98,at,dur*.35,gain*.28,.002);};
 /** A short brass-like stab: two detuned saws through the limiter, with a sine body. */
 const stab=(f:number,at:number,dur:number,gain=.09)=>{tone('sawtooth',f,f,at,dur,gain,.012);tone('sawtooth',f*1.006,f*1.006,at,dur,gain*.8,.012);tone('sine',f,f,at,dur*1.1,gain*1.6,.01);};
 return {
  unlock,
  get context(){return ctx;},
  /** A piece picked up from the tray: a light felt tap, pitched by size. */
  lift(n:number){if(!on())return;tone('triangle',520+n*40,640+n*40,0,.06,.09,.002);},
  /** A piece set on the pitch: a wooden block, lower for bigger shapes. */
  drop(n:number){if(!on())return;tone('sine',300-n*22,150-n*12,0,.09,.32,.002);burst('bandpass',1800,1.2,0,.03,.14);bar(hz(-12+n),.0,.08,.12);},
  /** Not here: a dull double knock. */
  nope(){if(!on())return;tone('square',150,120,0,.06,.07,.002);tone('square',130,100,.08,.07,.06,.002);},
  /** Lines cleared: a rising chord, one note a line, lifted by the streak; a clap; a horn stab for a combo. */
  clear(lines:number,streak:number){if(!on())return;const lift=Math.min(LINE_SCALE.length-4,Math.max(0,streak-1));
   for(let i=0;i<Math.min(4,lines)+1;i++)bar(hz(LINE_SCALE[lift+i]),i*.055,.2,.34);burst('bandpass',1500,.9,.02,.08,.3);burst('bandpass',1750,.9,.12,.07,.2);
   if(lines>=2){stab(hz(LINE_SCALE[lift]-12),.1,.22);stab(hz(LINE_SCALE[lift]-5),.1,.22,.07);}tone('triangle',110,70,0,.18,.28);},
  /** Clean sheet: the whole pitch is empty. Horn fanfare and crowd-like noise swell. */
  clean(){if(!on())return;stab(hz(-12),0,.16);stab(hz(-8),.13,.16);stab(hz(-5),.26,.16);stab(hz(0),.39,.6,.11);burst('bandpass',900,.5,.2,.9,.12);for(let i=0;i<5;i++)bar(hz(12+LINE_SCALE[i]),.62+i*.05,.09,.25);},
  /** A new tray: three soft ticks. */
  deal(){if(!on())return;for(let i=0;i<3;i++)tone('sine',880+i*120,880+i*120,i*.04,.04,.04,.002);},
  /** The streak ran out: one falling note. */
  streakLost(){if(!on())return;tone('sine',600,380,0,.18,.07);},
  level(){if(!on())return;bar(hz(7),0,.16,.18);bar(hz(12),.1,.18,.3);},
  /** The referee walks on: a pea-whistle trill. */
  whistle(){if(!on()||!ctx||!master)return;const t=ctx.currentTime,o1=ctx.createOscillator(),o2=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();voices+=2;
   o1.type='sine';o2.type='sine';o1.frequency.value=2850;o2.frequency.value=3180;lfo.type='square';lfo.frequency.value=38;lg.gain.value=160;lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.13*vol(),t+.015);g.gain.setValueAtTime(.13*vol(),t+.2);g.gain.exponentialRampToValueAtTime(.0001,t+.3);
   o1.connect(g);o2.connect(g);g.connect(master);o1.start(t);o2.start(t);lfo.start(t);o1.stop(t+.33);o2.stop(t+.33);lfo.stop(t+.33);
   o1.onended=()=>{voices-=2;o1.disconnect();o2.disconnect();lfo.disconnect();lg.disconnect();g.disconnect();};},
  /** The referee leaves the square. */
  refOff(){if(!on())return;bar(hz(4),0,.1,.14);bar(hz(9),.06,.1,.18);},
  /** No piece fits: a low thud and a falling three-bar phrase. */
  over(){if(!on())return;tone('sine',130,38,0,.42,.5,.003);burst('lowpass',900,.7,0,.22,.35);bar(hz(7,262),.16,.2,.3);bar(hz(3,262),.32,.2,.3);bar(hz(0,262),.48,.24,.6);},
  medal(n:number){if(!on())return;const k=2+Math.min(3,Math.max(1,n));for(let i=0;i<k;i++)bar(hz([0,4,7,12,16][i]),.5+i*.09,.22,.4);burst('highpass',6500,.7,.5+k*.09,.4,.08);},
  tap(){if(!on())return;bar(hz(12,392),0,.12,.09);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
