/**
 * Hold the Line sound (Nov 21 2026): the touchline. A soft boot tick for each pass, a rising creak for the passer's wind-up, the
 * SNAP of the assistant referee's flag and the referee's two-note whistle for offside, a studs-and-leather thump for a tackle or a
 * block, a long boot for a swept ball, a short crowd swell for a stop and a groan with the net for a goal, and a glockenspiel
 * for cards, pages of the trap book and medals.
 * Synthesised, no files. Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination
 * (tests/holdtheline-core.cjs greps this wiring; scripts/check-arcade-audio.cjs measures real output). The context is made on the
 * first tap (unlock) and resumed there, so nothing plays before a gesture. No loops, no music and no timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

const hz=(semi:number,base=659.25)=>base*Math.pow(2,semi/12);
export type HoldthelineAudio=ReturnType<typeof createHoldthelineAudio>;
export function createHoldthelineAudio(){
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
  /** kick-off and full time: the referee's pea whistle */
  whistle(long=false){if(!on())return;const d=long?.5:.22;tone('square',2350,2300,0,d,.05,.01);tone('square',2480,2440,0,d,.045,.01);burst('bandpass',2400,3,0,d,.05);},
  /** a pass along the ground: a soft boot tick (a switch of play is a fuller thump) */
  pass(big=false){if(!on())return;tone('sine',(big?130:210)*j(),big?52:90,0,big?.16:.07,big?.34:.16,.002);burst('lowpass',big?1200:1700,.8,0,big?.07:.04,big?.22:.1);},
  /** the wind-up: a short rising creak, the cue to step */
  windup(secs:number){if(!on())return;const d=Math.max(.25,Math.min(1.1,secs));tone('triangle',180,420,0,d,.09,.03);},
  /** the flag snaps up and the whistle goes: offside */
  flag(){if(!on())return;burst('highpass',2800,.7,0,.06,.5);burst('bandpass',1500,1.4,.03,.09,.3);tone('square',2350,2350,.12,.13,.05,.01);tone('square',2480,2480,.12,.13,.045,.01);tone('square',2350,2300,.3,.3,.05,.01);tone('square',2480,2440,.3,.3,.045,.01);},
  /** the ball is won: studs and leather */
  tackle(){if(!on())return;burst('bandpass',900*j(),1,0,.08,.5);tone('sine',170,64,0,.2,.42,.002);},
  /** a long boot away after a swept ball */
  sweep(){if(!on())return;tone('sine',120,46,0,.24,.5,.002);burst('lowpass',1500,.8,0,.08,.3);},
  /** a defender sets off to press: a short swish */
  press(){if(!on())return;burst('bandpass',700,.7,0,.16,.14,2200);},
  /** a stop: the crowd lifts. big = an offside trap or a clean sheet */
  cheer(big:boolean){if(!on())return;swell(600,1500,0,big?2:1.1,big?.2:.12,.1);if(big)swell(1100,2200,.05,1.6,.1,.2);},
  /** a goal against: the net, a low drum, the crowd sinks */
  goal(){if(!on())return;burst('highpass',2600,.6,0,.34,.2,900);tone('sine',120,46,.02,.4,.36,.004);swell(900,340,.05,1.1,.12,.08);},
  /** they are through, or they shoot: a small alert */
  alert(){if(!on())return;glock(hz(12),0,.1,.14);glock(hz(12),.09,.1,.14);},
  /** a new page of the trap book */
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
