/**
 * Pop-up target game sound (working id `popup`, Nov 21 2026, docs/arcade-aaa/popup-direction.md): a fairground shooting gallery with a
 * football. A boot thump for every flick (pitch by power), a slide whistle when a target pops up, wooden clack for dummies,
 * cardboard slap for cut-outs, tin clang for armour, a balloon pop, a referee whistle for the wrong target, and a marimba that climbs
 * with the combo. The structure (one-shot voices, one limiter, unlock on the first gesture) follows Flick It's audio.ts
 * (branch game-flickit, not on main; small pieces copied, nothing imported).
 * Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination. No loops or timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';
import {K} from './core';

const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
/** The combo climbs this marimba scale (semitones above C5). */
export const POP_SCALE=[0,2,4,7,9,12,14,16,19,21,24] as const;
export type PopupAudio=ReturnType<typeof createPopupAudio>;
export function createPopupAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0,quiet=false,popAt=0;
 const on=()=>!!ctx&&ctx.state==='running'&&!quiet&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.85;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.14;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.7);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=13579;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
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
 const j=()=>1+(Math.random()-.5)*.1;
 const mar=(f:number,at:number,dur:number,gain=.3)=>{tone('sine',f,f,at,dur,gain,.003);tone('sine',f*4,f*4,at,dur*.35,gain*.25,.002);};
 return {
  unlock,
  get running(){return !!ctx&&ctx.state==='running';},
  hush(v:boolean){quiet=v;if(ctx&&master)master.gain.setTargetAtTime(v?0:.85,ctx.currentTime,.025);},
  /** The boot on the ball: deeper and louder with power; three balls are a wider thump. */
  flick(power:number,n:number){if(!on())return;const p=Math.max(0,Math.min(1,power));tone('sine',180-p*60,50,0,.14+p*.06,.45+p*.3,.002);burst('lowpass',900+p*1000,.8,0,.06,.3+p*.25);
   burst('bandpass',900,1.2,.02,.2+p*.1,.08+p*.06,1900);if(n>1)tone('sine',230,70,.025,.12,.3,.002);},
  /** A target slides out: a short slide whistle, up for rising, never more than ~6 a second. */
  pop(kind:number){if(!on()||!ctx)return;if(ctx.currentTime-popAt<.15)return;popAt=ctx.currentTime;
   if(kind===K.friend){tone('triangle',hz(-5),hz(-2),0,.16,.08,.02);return;}if(kind===K.gold){for(let i=0;i<3;i++)tone('triangle',hz(12+i*4),hz(12+i*4),i*.05,.08,.1,.003);return;}
   tone('sine',hz(-7)*j(),hz(5),0,.17,.1,.02);},
  /** A target goes down: its own material, then the combo's marimba note. */
  knock(kind:number,combo:number){if(!on())return;const r=j();
   switch(kind){
    case K.dummy:burst('bandpass',800*r,3,0,.07,.45);tone('triangle',420*r,260,0,.08,.22);burst('bandpass',500,2,.09,.05,.2);break;
    case K.peeker:burst('bandpass',380*r,1.2,0,.11,.55);burst('highpass',2600,1,0,.04,.15);break;
    case K.armour:tone('square',900*r,700,0,.09,.12);tone('triangle',1700*r,1500,0,.35,.13);burst('highpass',4500,1,0,.08,.2);break;
    case K.balloon:burst('highpass',1800*r,.8,0,.06,.55);tone('sine',700,160,0,.07,.26,.002);break;
    case K.runner:tone('sine',hz(4)*r,hz(4),0,.25,.2);burst('bandpass',600,2,0,.1,.35);tone('triangle',260,120,.04,.18,.2);break;
    case K.gold:for(let i=0;i<5;i++)mar(hz([12,16,19,24,28][i]),i*.05,.2,.24);burst('highpass',6500,.7,0,.4,.12);break;
    case K.bag:burst('lowpass',600*r,1,0,.16,.5);tone('sine',140,70,0,.16,.36);break;
    default:burst('bandpass',900,1.5,0,.08,.3);}
   const s=POP_SCALE[Math.min(Math.max(0,combo-1),POP_SCALE.length-1)];mar(hz(s),.04,.18,.26);},
  /** Armour hit once: a hollow tin clang. */
  clang(){if(!on())return;const r=j();tone('square',620*r,540,0,.1,.12);tone('sine',1240*r,1180,0,.45,.18,.002);tone('sine',2790*r,2700,0,.22,.07,.002);},
  /** The coach or the referee: the whistle. */
  whistle(){if(!on())return;for(let i=0;i<2;i++){tone('square',2350,2300,i*.2,.15,.06,.01);tone('sine',2400,2350,i*.2,.15,.12,.01);}tone('sine',220,140,.05,.3,.2);},
  multi(n:number){if(!on())return;for(let i=0;i<Math.min(6,n+2);i++)mar(hz([0,4,7,12,16,19][i]),i*.07,.24,.3);burst('bandpass',1500,.7,0,.6,.16,400);},
  power(kind:number){if(!on())return;if(kind===1)for(let i=0;i<4;i++)mar(hz([7,12,19,24][i]),i*.06,.2,.3);else{for(let i=0;i<6;i++)tone('triangle',hz(i*2),hz(i*2),i*.035,.05,.1);}},
  fire(){if(!on())return;burst('bandpass',300,.7,0,.6,.22,2400);mar(hz(12),.1,.3,.3);mar(hz(19),.2,.3,.3);},
  miss(){if(!on())return;tone('sine',150,90,0,.08,.12,.002);},
  thud(f:number){if(!on())return;tone('sine',120+f*60,60,0,.08,.08+f*.18,.002);burst('lowpass',600,1,0,.05,.06+f*.12);},
  empty(){if(!on())return;tone('triangle',hz(-12),hz(-14),0,.08,.1);},
  tick(n:number){if(!on())return;tone('sine',n<=3?hz(12):hz(7),n<=3?hz(12):hz(7),0,.06,.14,.002);},
  over(){if(!on())return;for(let i=0;i<3;i++){tone('square',2300,2250,i*.32,i===2?.6:.18,.06,.01);tone('sine',2350,2300,i*.32,i===2?.6:.18,.1,.01);}},
  start(){if(!on())return;tone('square',2300,2250,0,.4,.06,.01);tone('sine',2350,2300,0,.4,.1,.01);},
  tap(){if(!on())return;mar(hz(7),0,.08,.12);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
