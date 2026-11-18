/**
 * Ball Blaster sound (Nov 17 2026): a training-ground toy box. A leather boot thump for every kick (deeper with charge), a whoosh for a
 * curl, wooden crate splinters, a glass tinkle, a hollow plastic clonk for cone towers, a wet pop for water barrels, tin-toy robot
 * clanks with a wind-down spring, a shield "tonk", a goal-horn for the boss and a marimba for waves and medals.
 * Synthesised, no files. Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/ballblaster-core.cjs
 * greps this wiring; scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed
 * there, so nothing plays before a gesture. No loops or timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

/** Combos climb this marimba scale (semitones above C5). */
export const COMBO_SCALE=[0,2,4,7,9,12,14,16,19] as const;
const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
export type BallblasterAudio=ReturnType<typeof createBallblasterAudio>;
export function createBallblasterAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.85;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.14;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.7);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=97531;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
  if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 function tone(type:OscillatorType,f0:number,f1:number,at:number,dur:number,gain:number,attack=.004){
  if(!ctx||!master||voices>28)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);o.onended=()=>{voices--;o.disconnect();g.disconnect();};
 }
 function burst(filter:BiquadFilterType,f:number,q:number,at:number,dur:number,gain:number,sweepTo=0){
  if(!ctx||!master||!noise||voices>28)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  src.buffer=noise;bq.type=filter;bq.frequency.setValueAtTime(f,t);bq.Q.value=q;if(sweepTo)bq.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);
  g.gain.setValueAtTime(gain*vol(),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*5.1)%.5,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** Marimba: a sine with a quick fourth-partial knock. */
 const mar=(f:number,at:number,gain=.16,dur=.32)=>{tone('sine',f,f,at,dur,gain,.002);tone('sine',f*3.93,f*3.9,at,dur*.18,gain*.35,.001);};
 return {
  unlock,
  get context(){return ctx;},
  /** the kick: a leather thump, deeper and longer with charge; a curl adds a spin whoosh */
  kick(power:number,curl:number){if(!on())return;tone('sine',160-power*50,48,0,.13+power*.06,.42+power*.2,.002);burst('lowpass',1300+power*700,.8,0,.05,.22);
   if(Math.abs(curl)>.05)burst('bandpass',900,2.2,.02,.34,.09,3200);},
  bounce(soft:boolean){if(!on())return;tone('sine',210,120,0,.07,soft?.06:.14,.002);},
  board(){if(!on())return;burst('bandpass',420,1.4,0,.14,.22);tone('square',95,70,0,.1,.06);},
  /** a hit that does not break: a tin clank */
  clank(){if(!on())return;tone('square',680,520,0,.06,.06,.001);tone('triangle',1240,1100,0,.12,.07,.001);},
  /** what broke: each material its own sound; `combo` climbs the marimba */
  smash(kind:number,combo:number){if(!on())return;
   if(kind===10){burst('bandpass',1500,.9,0,.18,.3,600);burst('highpass',3800,.8,.03,.1,.12);tone('sine',140,80,0,.1,.2);}// crate splinters
   else if(kind===11){for(let i=0;i<5;i++)tone('sine',2600+i*530,2500+i*500,i*.025,.22,.05,.001);burst('highpass',6200,.6,0,.25,.14);}// glass
   else if(kind===12){tone('triangle',330,190,0,.18,.18,.002);tone('triangle',250,150,.08,.18,.14,.002);}// hollow cones
   else if(kind===13){tone('sine',120,70,0,.2,.28);burst('lowpass',500,.9,0,.16,.2);}// rubber tyres
   else if(kind===15){burst('bandpass',900,.7,0,.4,.3,300);tone('square',220,90,0,.3,.07);}// a scoreboard
   else if(kind===8){tone('sawtooth',220,60,0,.8,.2,.01);burst('lowpass',1200,.6,0,.7,.4,200);}// the boss
   else if(kind<10){tone('square',900,240,0,.16,.08,.001);burst('bandpass',2400,1.5,0,.14,.16);tone('triangle',1800,300,.06,.32,.06);}// a robot: clank + wind-down spring
   const i=Math.min(COMBO_SCALE.length-1,Math.max(0,combo-1));if(combo>=2)mar(hz(COMBO_SCALE[i]),.04,.12,.26);},
  /** a water barrel bursting */
  boom(){if(!on())return;tone('sine',95,38,0,.4,.5,.003);burst('lowpass',1800,.7,0,.42,.42,240);burst('bandpass',3000,1,.05,.3,.12,900);},
  topple(){if(!on())return;tone('triangle',260,110,0,.3,.14);burst('bandpass',700,1,0,.3,.14);},
  block(){if(!on())return;tone('triangle',520,500,0,.18,.18,.001);tone('sine',1560,1500,0,.12,.06,.001);},
  dodge(){if(!on())return;burst('bandpass',2000,2,0,.12,.07,800);},
  trick(n:number){if(!on())return;for(let i=0;i<Math.min(5,n+1);i++)mar(hz([0,4,7,12,16][i]),i*.07,.14,.3);},
  power(){if(!on())return;for(let i=0;i<4;i++)mar(hz(i*4+7),i*.05,.13,.28);burst('highpass',7000,.7,.18,.3,.07);},
  /** a machine got to the goal line: a referee's short whistle and a low buzz */
  leak(){if(!on()||!ctx||!master)return;tone('sawtooth',110,90,0,.4,.16,.01);
   const t=ctx.currentTime+.02,o=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();voices+=2;
   o.type='sine';o.frequency.value=2800;lfo.type='square';lfo.frequency.value=30;lg.gain.value=130;lfo.connect(lg);lg.connect(o.frequency);
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09*vol(),t+.012);g.gain.setValueAtTime(.09*vol(),t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+.26);
   o.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+.28);lfo.stop(t+.28);o.onended=()=>{voices-=2;o.disconnect();lfo.disconnect();lg.disconnect();g.disconnect();};},
  empty(){if(!on())return;tone('sine',300,260,0,.06,.06);},
  wave(boss:boolean){if(!on())return;if(boss){tone('sawtooth',180,180,0,.5,.12,.02);tone('sawtooth',227,227,0,.5,.1,.02);tone('sawtooth',180,180,.55,.6,.12,.02);}else{mar(hz(0),0,.12);mar(hz(7),.1,.12);}},
  clear(){if(!on())return;mar(hz(0),0,.13);mar(hz(4),.08,.13);mar(hz(7),.16,.13);mar(hz(12),.24,.16,.5);},
  over(){if(!on())return;tone('sine',140,40,0,.5,.4,.003);burst('lowpass',800,.7,0,.24,.26);mar(hz(-5),.18,.14);mar(hz(-9),.36,.14);mar(hz(-12),.54,.16,.6);},
  medal(n:number){if(!on())return;const k=2+Math.min(3,Math.max(1,n));for(let i=0;i<k;i++)mar(hz([0,4,7,12,16][i]),.5+i*.09,.16,.4);burst('highpass',6500,.7,.5+k*.09,.4,.08);},
  tap(){if(!on())return;mar(hz(7),0,.08,.12);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
