/**
 * Street Dash sound (Nov 17 2026): a street-band palette for the side-on run. Rubber-ball pops, sneaker scuffs, a steel-drum bell
 * for stars, a leather thump for the volley, splintering crates, a crowd roar for street goals, a dog's yip and a ref's whistle.
 * Synthesised, no files. Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/streetdash-core.cjs
 * greps this wiring; scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed
 * there, so nothing plays before a gesture. No loops or timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

/** Stars climb this steel-drum scale while they come in a run (semitones above A5). */
export const STAR_SCALE=[0,2,4,7,9,12,14,16] as const;
const hz=(semi:number,base=880)=>base*Math.pow(2,semi/12);
export type StreetdashAudio=ReturnType<typeof createStreetdashAudio>;
export function createStreetdashAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0,starRun=0,starAt=0;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.9;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.12;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.6);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=2468013;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
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
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*7.3)%.4,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** Steel-drum bell: a sine with a bent fifth partial and a quick decay. */
 const pan=(f:number,at:number,gain=.16,dur=.3)=>{tone('sine',f*1.01,f,at,dur,gain,.002);tone('sine',f*2.98,f*2.95,at,dur*.4,gain*.3,.002);tone('triangle',f*.5,f*.5,at,dur*.5,gain*.25,.004);};
 return {
  unlock,
  get context(){return ctx;},
  /** take-off: a rubber pop that rises, higher for a held jump */
  jump(){if(!on())return;tone('square',300,620,0,.09,.05,.002);tone('sine',220,440,0,.12,.14,.003);burst('highpass',2600,.7,0,.04,.05);},
  /** sneaker on the street */
  land(hard:boolean){if(!on())return;tone('sine',150,70,0,.08,hard?.26:.15,.002);burst('bandpass',1200,1.1,0,.05,hard?.14:.08);},
  slide(){if(!on())return;burst('bandpass',2400,.6,0,.32,.16,700);tone('sine',180,120,0,.12,.08);},
  fastfall(){if(!on())return;tone('triangle',700,240,0,.14,.06);},
  /** the volley: a leather thump and the whip of the boot */
  volley(){if(!on())return;tone('sine',120,48,0,.14,.5,.002);burst('bandpass',3200,.8,0,.035,.24);burst('highpass',5000,.7,.02,.12,.06,9000);},
  crate(){if(!on())return;burst('bandpass',900,1.4,0,.12,.36);burst('bandpass',2100,1.8,.03,.09,.22);tone('square',190,90,0,.08,.06);for(let i=0;i<3;i++)burst('bandpass',3000+i*700,3,.06+i*.04,.03,.08);},
  gate(){if(!on())return;tone('triangle',520,780,0,.1,.12);tone('triangle',780,1040,.06,.12,.1);burst('bandpass',1500,1,0,.08,.14);},
  /** a street goal: net swish, the crowd and a short horn */
  goal(streak:number){if(!on())return;burst('bandpass',1400,.6,0,.18,.22,600);burst('bandpass',700,.35,.08,.9,.2);const r=Math.min(4,streak);
   for(let i=0;i<3;i++)tone('sawtooth',hz(-12+[0,4,7][i]+r,440),hz(-12+[0,4,7][i]+r,440),.12+i*.07,.24,.05,.01);pan(hz(12+r),.34,.14,.4);},
  /** stars ring a scale while they come close together */
  star(){if(!on()||!ctx)return;const t=ctx.currentTime;starRun=t-starAt<.5?Math.min(STAR_SCALE.length-1,starRun+1):0;starAt=t;pan(hz(STAR_SCALE[starRun]),0,.12,.22);},
  near(){if(!on())return;burst('bandpass',1800,.8,0,.2,.12,4200);pan(hz(7),.06,.08,.18);},
  /** a hit: the whistle, an oof, the ball knocked loose */
  hit(kind:number){if(!on()||!ctx||!master)return;
   if(kind===6){tone('square',900,1300,0,.05,.06,.002);tone('square',1000,1500,.08,.06,.06,.002);}// the dog's yip
   tone('sine',260,110,0,.24,.26);burst('lowpass',700,.8,0,.16,.22);tone('sine',420,200,.12,.18,.08);
   const t=ctx.currentTime+.02,o=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();voices+=2;
   o.type='sine';o.frequency.value=2950;lfo.type='square';lfo.frequency.value=34;lg.gain.value=140;lfo.connect(lg);lg.connect(o.frequency);
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.1*vol(),t+.012);g.gain.setValueAtTime(.1*vol(),t+.16);g.gain.exponentialRampToValueAtTime(.0001,t+.24);
   o.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+.26);lfo.stop(t+.26);o.onended=()=>{voices-=2;o.disconnect();lfo.disconnect();lg.disconnect();g.disconnect();};},
  /** a soft bump in the lessons: no whistle */
  oops(){if(!on())return;tone('sine',300,180,0,.16,.14);},
  fall(){if(!on())return;tone('triangle',700,160,0,.42,.1);},
  teach(){if(!on())return;pan(hz(0,660),0,.1,.16);pan(hz(7,660),.08,.1,.2);},
  level(){if(!on())return;pan(hz(0),0,.1,.18);pan(hz(4),.07,.1,.18);pan(hz(7),.14,.12,.28);},
  /** a new backdrop: a gull-ish glide on the beach, a bell otherwise */
  theme(t:number){if(!on())return;if(t===2){tone('sine',1500,2100,0,.16,.05);tone('sine',2100,1400,.16,.2,.05);}else pan(hz(-5),0,.1,.3);},
  over(){if(!on())return;tone('sine',140,40,0,.5,.45,.003);burst('lowpass',800,.7,0,.24,.3);pan(hz(-5,440),.18,.14,.3);pan(hz(-9,440),.36,.14,.3);pan(hz(-12,440),.54,.16,.6);},
  medal(n:number){if(!on())return;const k=2+Math.min(3,Math.max(1,n));for(let i=0;i<k;i++)pan(hz([0,4,7,12,16][i],660),.5+i*.09,.16,.4);burst('highpass',6500,.7,.5+k*.09,.4,.08);},
  tap(){if(!on())return;pan(hz(0,660),0,.08,.1);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
