/**
 * Safe Hands sound (Nov 21 2026): the goal mouth. A referee's pea whistle before each kick, a leather boot thump (deeper with power),
 * the slap of gloves on the ball (a soft "thup" for a catch, a sharp smack for a parry, a light flick for fingertips), the net's swish
 * and a low drum for a goal, a short crowd swell for a save and a groan for a goal, and a glockenspiel for rounds, gloves and medals.
 * Synthesised, no files. Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/safehands-core.cjs
 * greps this wiring; scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed
 * there, so nothing plays before a gesture. No loops, no music and no timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

const hz=(semi:number,base=659.25)=>base*Math.pow(2,semi/12);
export type SafehandsAudio=ReturnType<typeof createSafehandsAudio>;
export function createSafehandsAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,murmur:AudioBuffer|null=null,voices=0,quiet=false;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.85;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.14;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.7);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=24680;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}
   // the crowd: 2.6 s of soft low noise (a running average of white noise), played as one-shot swells
   const ml=Math.floor(ctx.sampleRate*2.6);murmur=ctx.createBuffer(1,ml,ctx.sampleRate);const md=murmur.getChannelData(0);let acc=0;for(let i=0;i<ml;i++){seed=(seed*1664525+1013904223)>>>0;acc+=((seed/2147483648-1)-acc)*.12;md[i]=acc*3;}}
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
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*5.1)%.5,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** A crowd swell: the murmur buffer through a band-pass that can sweep (never looped). */
 function swell(f0:number,f1:number,at:number,dur:number,gain:number,attack:number){
  if(!ctx||!master||!murmur||voices>24)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at,d=Math.min(2.5,dur);voices++;
  src.buffer=murmur;bq.type='bandpass';bq.Q.value=.6;bq.frequency.setValueAtTime(f0,t);if(f1!==f0)bq.frequency.exponentialRampToValueAtTime(f1,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.setValueAtTime(gain*vol(),t+d*.55);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,0,d);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** a glockenspiel bar: a sine with a bright overtone */
 const glock=(f:number,at:number,dur:number,gain=.2)=>{tone('sine',f,f,at,dur,gain,.002);tone('sine',f*2.76,f*2.76,at,dur*.4,gain*.3,.002);};
 const j=()=>1+(Math.random()-.5)*.08;
 return {
  unlock,
  get running(){return !!ctx&&ctx.state==='running';},
  tap(){if(!on())return;glock(hz(5),0,.09,.1);},
  /** the referee's whistle: a pea whistle is two close tones that beat */
  whistle(short=false){if(!on())return;const d=short?.16:.34;tone('square',2350,2300,0,d,.05,.01);tone('square',2480,2440,0,d,.045,.01);burst('bandpass',2400,3,0,d,.05);},
  /** the kick: a leather thump, deeper and louder with power */
  kick(power:number){if(!on())return;const p=Math.max(0,Math.min(1,power));tone('sine',(150-p*40)*j(),48,0,.16+p*.08,.3+p*.25,.002);burst('lowpass',900+p*900,.8,0,.07,.2+p*.2);},
  /** gloves on the ball: 0 held (soft), 1 parry (sharp), 2 fingertips (light), 3 punch / tip */
  glove(kind:number){if(!on())return;
   if(kind===0){tone('sine',190*j(),90,0,.16,.34,.003);burst('lowpass',700,.7,0,.09,.3);}
   else if(kind===1){burst('bandpass',1700*j(),1.2,0,.07,.5);tone('triangle',260,120,0,.1,.22,.002);}
   else if(kind===2){burst('highpass',3200,.8,0,.05,.3);tone('sine',880,1320,0,.12,.1,.003);}
   else{burst('bandpass',1100,1,0,.09,.5);tone('sine',170,70,0,.18,.4,.002);}},
  /** a save: the crowd lifts. big = a fingertip save or a clean round */
  cheer(big:boolean){if(!on())return;swell(600,1500,0,big?2.2:1.2,big?.2:.12,.1);if(big)swell(1100,2200,.05,1.8,.1,.2);},
  /** a goal against: the net, a low drum, the crowd sinks */
  goal(){if(!on())return;burst('highpass',2600,.6,0,.34,.2,900);tone('sine',120,46,.02,.4,.36,.004);swell(900,340,.05,1.1,.12,.08);},
  spill(){if(!on())return;burst('bandpass',900,1,0,.08,.35);tone('triangle',300,140,.03,.14,.16,.002);},
  /** the action is taken: a short swish of the dive */
  dive(){if(!on())return;burst('bandpass',700,.7,0,.16,.14,2200);},
  /** a heavy touch, a deflection, the cross is hit: a small alert */
  alert(){if(!on())return;glock(hz(12),0,.1,.14);glock(hz(12),.09,.1,.14);},
  /** a round cleared */
  clear(){if(!on())return;glock(hz(0),0,.14);glock(hz(4),.08,.14);glock(hz(7),.16,.14);glock(hz(12),.24,.3);},
  /** a new pair of gloves or a new line on a scouting card */
  prize(){if(!on())return;glock(hz(7),0,.12,.16);glock(hz(12),.07,.12,.16);glock(hz(16),.14,.26,.18);},
  round(){if(!on())return;glock(hz(-5),0,.12,.14);glock(hz(0),.1,.2,.16);},
  over(won:boolean){if(!on())return;if(won){for(let i=0;i<5;i++)glock(hz([0,4,7,12,16][i]),i*.1,.3,.2);swell(600,1700,0,2.4,.22,.15);}else{glock(hz(-5),0,.16);glock(hz(-9),.18,.16);glock(hz(-12),.36,.4);}},
  medal(n:number){if(!on())return;const k=2+Math.min(3,Math.max(1,n));for(let i=0;i<k;i++)glock(hz([0,4,7,12,16][i]),.5+i*.09,.2,.18);},
  /** pause: the master fades out so no tail rings on; resume brings it back */
  hush(v:boolean){quiet=v;if(ctx&&master)master.gain.setTargetAtTime(v?0:.85,ctx.currentTime,.025);},
  get hushed(){return quiet;},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;murmur=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
