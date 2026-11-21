/**
 * Flick It sound (Nov 21 2026): a back-garden toy box. A leather boot thump for every kick (deeper with power) and a whoosh that
 * follows the curl, tin for cans, wood for crates, a hollow plastic bonk for barrels and bins, a balloon pop, a bell, a post ping,
 * a net swish and a marimba step for every extra hit of one flick.
 * Synthesised, no files. Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/flickit-core.cjs
 * greps this wiring). The context is made on the first tap (unlock) and resumed there, so nothing plays before a gesture.
 * No loops or timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';
import {K} from './core';

const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
/** Combos climb this marimba scale (semitones above C5). */
export const FLICK_SCALE=[0,4,7,12,16,19,24] as const;
export type FlickitAudio=ReturnType<typeof createFlickitAudio>;
export function createFlickitAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0,quiet=false;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.85;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.14;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.7);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=24680;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
  if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 function tone(type:OscillatorType,f0:number,f1:number,at:number,dur:number,gain:number,attack=.004){
  if(!ctx||!master||voices>26)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);o.onended=()=>{voices--;o.disconnect();g.disconnect();};
 }
 function burst(filter:BiquadFilterType,f:number,q:number,at:number,dur:number,gain:number,sweepTo=0){
  if(!ctx||!master||!noise||voices>26)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  src.buffer=noise;bq.type=filter;bq.frequency.setValueAtTime(f,t);bq.Q.value=q;if(sweepTo)bq.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);
  g.gain.setValueAtTime(gain*vol(),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*5.1)%.5,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 const j=()=>1+(Math.random()-.5)*.1;
 const mar=(f:number,at:number,dur:number,gain=.3)=>{tone('sine',f,f,at,dur,gain,.003);tone('sine',f*4,f*4,at,dur*.35,gain*.25,.002);};
 return {
  unlock,
  get running(){return !!ctx&&ctx.state==='running';},
  hush(v:boolean){quiet=v;if(ctx&&master)master.gain.setTargetAtTime(v?0:.85,ctx.currentTime,.025);},
  get hushed(){return quiet;},
  /** The boot on the ball: deeper and louder with power; the whoosh's pitch slides the way the ball will bend. */
  kick(power:number,spin:number){if(!on())return;const p=Math.max(0,Math.min(1,power));tone('sine',170-p*50,48,0,.16+p*.08,.5+p*.3,.002);burst('lowpass',900+p*900,.8,0,.07,.35+p*.25);
   burst('bandpass',spin>=0?700:1500,1.4,.03,.34+Math.abs(spin)*.3,.1+Math.abs(spin)*.16+p*.06,spin>=0?1500:700);},
  /** A thing is hit: its own material. `n` is the hit's place in the flick's combo (1 = first). */
  hit(kind:number,n:number){if(!on())return;const r=j();
   switch(kind){
    case K.can:tone('square',1250*r,900,0,.07,.12);tone('triangle',2100*r,1700,0,.11,.1);burst('highpass',4200,1,0,.06,.16);break;
    case K.crate:burst('bandpass',420*r,2,0,.12,.5);tone('triangle',180*r,90,0,.12,.3);burst('highpass',2600,1,.03,.08,.14);break;
    case K.bottle:tone('sine',860*r,620,0,.09,.26);burst('bandpass',1800,3,0,.05,.16);break;
    case K.cone:burst('bandpass',700*r,2,0,.08,.3);break;
    case K.barrel:tone('sine',120*r,70,0,.34,.5);burst('lowpass',500,1,0,.2,.4);break;
    case K.hoop:case K.tyre:tone('sine',hz(12)*r,hz(19),0,.22,.26,.01);burst('bandpass',1200,1,0,.24,.2,3200);break;
    case K.bin:tone('sine',150,80,0,.3,.5);burst('lowpass',700,1,.02,.24,.4);tone('triangle',hz(7),hz(12),.1,.2,.16);break;
    case K.bell:for(const [f,g] of [[1,.34],[2.76,.16],[5.4,.08]] as const)tone('sine',hz(9)*f,hz(9)*f*.995,0,1.3,g,.002);break;
    case K.shutter:burst('bandpass',520*r,2,0,.1,.4);tone('square',240,180,.02,.08,.08);burst('bandpass',380,2,.2,.08,.2);break;
    case K.sign:for(let i=0;i<4;i++)tone('triangle',1500+i*130,1400+i*130,i*.07,.06,.14);tone('square',2300,2300,.3,.16,.05,.01);break;
    case K.trolley:tone('sine',hz(4)*r,hz(4),0,.3,.22);tone('sine',hz(11),hz(11),.02,.34,.16);burst('bandpass',600,2,0,.1,.3);break;
    case K.bar:tone('sine',hz(14)*r,hz(14),0,.5,.3,.002);tone('sine',hz(14)*2.4,hz(14)*2.4,0,.24,.12,.002);break;
    default:burst('bandpass',900,1.5,0,.08,.2);}
   if(n>1){const s=FLICK_SCALE[Math.min(n-1,FLICK_SCALE.length-1)];mar(hz(s),.05,.2,.3);}},
  pop(){if(!on())return;burst('highpass',1800*j(),.8,0,.06,.5);tone('sine',700,160,0,.07,.26,.002);},
  ping(){if(!on())return;const r=j();tone('sine',hz(16)*r,hz(16)*r,0,.36,.24,.002);tone('sine',hz(16)*2.7*r,hz(16)*2.7*r,0,.16,.08,.002);},
  block(){if(!on())return;tone('sine',150*j(),80,0,.14,.4);burst('lowpass',600,1,0,.1,.3);},
  weak(){if(!on())return;tone('sine',110,80,0,.22,.4);tone('triangle',hz(-5),hz(-8),.08,.2,.14);},
  saved(){if(!on())return;burst('bandpass',500,1.5,0,.1,.4);tone('square',300,200,.04,.12,.08);tone('square',240,160,.2,.14,.08);},
  bounce(soft:boolean){if(!on())return;tone('sine',soft?120:150,60,0,.09,soft?.14:.26,.002);},
  goal(corner:boolean){if(!on())return;burst('bandpass',1600,.7,0,.5,.3,500);for(let i=0;i<(corner?5:4);i++)mar(hz([0,4,7,12,16][i]),.08+i*.08,.2,.3);},
  net(){if(!on())return;burst('bandpass',1400,.8,0,.3,.26,500);},
  trick(){if(!on())return;for(let i=0;i<4;i++)mar(hz([7,12,16,19][i]),i*.06,.18,.28);burst('highpass',6500,.7,.2,.3,.08);},
  near(){if(!on())return;burst('bandpass',300,.8,0,.5,.12,1600);},
  close(){if(!on())return;tone('triangle',hz(4),hz(0),0,.24,.16,.01);},
  tee(){if(!on())return;tone('sine',300,360,0,.06,.1);},
  /** A level ends: one marimba note per star, a low thud for none. */
  level(stars:number){if(!on())return;if(stars<=0){tone('sine',140,50,0,.4,.36);mar(hz(-5),.15,.16);mar(hz(-9),.33,.2);return;}for(let i=0;i<stars;i++)mar(hz([0,7,12][i]),.1+i*.22,.26,.36);if(stars===3){mar(hz(16),.76,.3,.34);burst('highpass',6500,.7,.76,.5,.1);}},
  stage(){if(!on())return;mar(hz(0),0,.12);mar(hz(7),.1,.14);},
  tap(){if(!on())return;mar(hz(7),0,.08,.12);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
